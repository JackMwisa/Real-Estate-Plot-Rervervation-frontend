import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useImmerReducer } from "use-immer";
import Axios from "axios";
import {
  Box,
  TextField,
  Typography,
  Button,
  useTheme,
  Paper,
  MenuItem,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Divider,
  Tooltip,
} from "@mui/material";
import styles from "./AddPropertyStyles";

// Leaflet
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ----------------------------------------
// Config
// ----------------------------------------
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const CREATE_URL = `${API_BASE}/api/listings/create/`;

const AREA_CHOICES = [
  { value: "", label: "" },
  { value: "urban", label: "Urban" },
  { value: "suburban", label: "Suburban" },
  { value: "rural", label: "Rural" },
];

const LISTING_TYPES = [
  { value: "", label: "" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
];

const STATUS_CHOICES = [
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold" },
  { value: "pending", label: "Pending" },
  { value: "rented", label: "Rented" },
];

const RENT_FREQ = [
  { value: "", label: "" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

// Common UG areas (quick jump)
const UG_AREAS = [
  { label: "Kampala (Central)", lat: 0.315, lng: 32.582, zoom: 13 },
  { label: "Makindye (Kampala)", lat: 0.285, lng: 32.602, zoom: 13 },
  { label: "Kawempe (Kampala)", lat: 0.37, lng: 32.555, zoom: 13 },
  { label: "Nakawa (Kampala)", lat: 0.332, lng: 32.633, zoom: 13 },
  { label: "Rubaga (Kampala)", lat: 0.307, lng: 32.534, zoom: 13 },
  { label: "Busega (Kampala)", lat: 0.305, lng: 32.507, zoom: 14 },
  { label: "Masaka", lat: -0.341, lng: 31.734, zoom: 13 },
  { label: "Mbarara", lat: -0.607, lng: 30.654, zoom: 13 },
  { label: "Gulu", lat: 2.774, lng: 32.298, zoom: 13 },
  { label: "Lira", lat: 2.249, lng: 32.899, zoom: 13 },
  { label: "Fort Portal", lat: 0.655, lng: 30.274, zoom: 13 },
  { label: "Mbale", lat: 1.082, lng: 34.176, zoom: 13 },
  { label: "Jinja", lat: 0.424, lng: 33.204, zoom: 13 },
  { label: "Entebbe", lat: 0.051, lng: 32.463, zoom: 13 },
  { label: "Arua", lat: 3.019, lng: 30.91, zoom: 13 },
  { label: "Soroti", lat: 1.714, lng: 33.611, zoom: 13 },
  { label: "Hoima", lat: 1.435, lng: 31.343, zoom: 13 },
  { label: "Busia", lat: 0.363, lng: 34.008, zoom: 13 },
  { label: "Tororo", lat: 0.692, lng: 34.183, zoom: 13 },
  { label: "Kabale", lat: -1.249, lng: 29.985, zoom: 13 },
  { label: "Kasese", lat: 0.183, lng: 30.081, zoom: 13 },
  { label: "Mityana", lat: 0.401, lng: 32.042, zoom: 13 },
  { label: "Mukono", lat: 0.353, lng: 32.755, zoom: 13 },
  { label: "Wakiso", lat: 0.396, lng: 32.478, zoom: 13 },
  { label: "Iganga", lat: 0.611, lng: 33.485, zoom: 13 },
];

// ----------------------------------------
// State
// ----------------------------------------
const initialState = {
  title: "",
  area: "",
  borough: "",
  listing_type: "",
  property_status: "available",
  rental_frequency: "",
  price: "",
  description: "",
  bedrooms: "",
  bathrooms: "",
  area_size: "",

  address: "",
  latitude: 0.313,     // Kampala default
  longitude: 32.581,
  mapInstance: null,

  image_main: null,
  image_2: null,
  image_3: null,
  image_4: null,
  imagePreview: null,

  errors: {},
  sending: false,
  snackOpen: false,
  geocoding: false,

  token: localStorage.getItem("auth_token") || "",
};

function reducer(draft, action) {
  switch (action.type) {
    case "field":
      draft[action.name] = action.value;
      if (draft.errors[action.name]) delete draft.errors[action.name];
      return;
    case "file":
      draft[action.name] = action.value;
      return;
    case "setPreview":
      draft.imagePreview = action.value;
      return;
    case "setMap":
      draft.mapInstance = action.value;
      return;
    case "setLatLng":
      draft.latitude = action.lat;
      draft.longitude = action.lng;
      if (draft.errors.latitude) delete draft.errors.latitude;
      return;
    case "errors":
      draft.errors = action.value || {};
      return;
    case "sending":
      draft.sending = action.value;
      return;
    case "snack":
      draft.snackOpen = action.value;
      return;
    case "geocoding":
      draft.geocoding = action.value;
      return;
    default:
      return;
  }
}

// ----------------------------------------
// Map helpers
// ----------------------------------------
function TheMapComponent({ onReady }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

function ClickToPlaceMarker({ onSet }) {
  useMapEvents({
    click(e) {
      onSet(e.latlng);
    },
  });
  return null;
}

// ----------------------------------------
// Component
// ----------------------------------------
export default function AddProperty() {
  const theme = useTheme();
  const [state, dispatch] = useImmerReducer(reducer, initialState);
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (!marker) return;
        const { lat, lng } = marker.getLatLng();
        dispatch({ type: "setLatLng", lat, lng });
      },
    }),
    [dispatch]
  );

  const validate = useCallback(() => {
    const e = {};
    if (!state.title.trim()) e.title = "Title is required";
    if (!state.area) e.area = "Area is required";
    if (!state.borough.trim()) e.borough = "Borough/Location is required";
    if (!state.listing_type) e.listing_type = "Listing type is required";
    if (!state.property_status) e.property_status = "Status is required";
    if (!state.price || Number(state.price) <= 0) e.price = "Enter a valid price";
    if (!state.description.trim()) e.description = "Description is required";
    if (state.latitude == null || state.longitude == null) e.latitude = "Pick a location on the map";
    return e;
  }, [state]);

  // image main + simple validation
  const onImageMain = (file) => {
    dispatch({ type: "file", name: "image_main", value: file || null });
    if (!file) return dispatch({ type: "setPreview", value: null });

    const okType =
      file.type && ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type);
    const okSize = file.size <= 5 * 1024 * 1024;
    if (!okType) {
      dispatch({ type: "errors", value: { ...state.errors, image_main: "Only JPG/PNG/WEBP/GIF allowed." } });
      dispatch({ type: "setPreview", value: null });
      return;
    }
    if (!okSize) {
      dispatch({ type: "errors", value: { ...state.errors, image_main: "Max size is 5MB." } });
      dispatch({ type: "setPreview", value: null });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => dispatch({ type: "setPreview", value: reader.result });
    reader.readAsDataURL(file);
  };

  // address → geocode (Nominatim)
  const geocodeAddress = async () => {
    const q = state.address?.trim();
    if (!q) {
      dispatch({ type: "errors", value: { ...state.errors, address: "Enter an address to search." } });
      return;
    }
    try {
      dispatch({ type: "geocoding", value: true });
      const res = await Axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: `${q}, Uganda`, format: "json", addressdetails: 1, limit: 1 },
        headers: { "Accept-Language": "en" },
      });
      const first = res.data?.[0];
      if (!first) {
        dispatch({ type: "errors", value: { ...state.errors, address: "No results found." } });
        return;
      }
      const lat = parseFloat(first.lat);
      const lng = parseFloat(first.lon);
      dispatch({ type: "setLatLng", lat, lng });
      if (state.mapInstance) state.mapInstance.flyTo([lat, lng], 15, { duration: 0.8 });
    } catch {
      dispatch({ type: "errors", value: { ...state.errors, address: "Geocoding failed. Try again." } });
    } finally {
      dispatch({ type: "geocoding", value: false });
    }
  };

  // quick jump to UG area
  const jumpToUgArea = (label) => {
    const found = UG_AREAS.find((a) => a.label === label);
    if (!found) return;
    const { lat, lng, zoom } = found;
    dispatch({ type: "field", name: "borough", value: label });
    dispatch({ type: "setLatLng", lat, lng });
    if (state.mapInstance) state.mapInstance.flyTo([lat, lng], zoom || 13, { duration: 0.8 });
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!state.token) {
      dispatch({ type: "errors", value: { nonField: "You must be logged in to add a property." } });
      return;
    }

    const eobj = validate();
    if (Object.keys(eobj).length) {
      dispatch({ type: "errors", value: eobj });
      return;
    }

    dispatch({ type: "sending", value: true });

    const fd = new FormData();
    fd.append("title", state.title);
    fd.append("description", state.description);
    fd.append("area", state.area);
    fd.append("borough", state.borough);
    fd.append("listing_type", state.listing_type);
    fd.append("property_status", state.property_status);
    if (state.rental_frequency) fd.append("rental_frequency", state.rental_frequency);
    fd.append("price", state.price);
    if (state.bedrooms) fd.append("bedrooms", state.bedrooms);
    if (state.bathrooms) fd.append("bathrooms", state.bathrooms);
    if (state.area_size) fd.append("area_size", state.area_size);
    fd.append("latitude", state.latitude);
    fd.append("longitude", state.longitude);
    if (state.image_main) fd.append("image_main", state.image_main);
    if (state.image_2) fd.append("image_2", state.image_2);
    if (state.image_3) fd.append("image_3", state.image_3);
    if (state.image_4) fd.append("image_4", state.image_4);

    try {
      await Axios.post(CREATE_URL, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${state.token}`,
        },
      });

      dispatch({ type: "snack", value: true });
      dispatch({ type: "errors", value: {} });
      [
        "title",
        "area",
        "borough",
        "listing_type",
        "rental_frequency",
        "price",
        "description",
        "bedrooms",
        "bathrooms",
        "area_size",
        "address",
      ].forEach((name) => dispatch({ type: "field", name, value: "" }));
      dispatch({ type: "field", name: "property_status", value: "available" });
      onImageMain(null);
      ["image_2", "image_3", "image_4"].forEach((k) => dispatch({ type: "file", name: k, value: null }));
    } catch (err) {
      const data = err?.response?.data || {};
      const mapped = {};
      Object.keys(data).forEach((k) => (mapped[k] = Array.isArray(data[k]) ? data[k][0] : String(data[k])));
      mapped.nonField ||= "Failed to create listing.";
      dispatch({ type: "errors", value: mapped });
    } finally {
      dispatch({ type: "sending", value: false });
    }
  };

  return (
    <Box sx={styles.pageWrap(theme)}>
      <Paper elevation={0} sx={styles.paper(theme)}>
        <Box sx={styles.header(theme)}>
          <Box>
            <Typography variant="h5" sx={styles.title(theme)}>Add New Property</Typography>
            <Typography variant="body2" color="text.secondary">
              Provide essential details, place the marker on the map, then submit. Fields marked * are required.
            </Typography>
          </Box>

          <Tooltip title="We’ll auto-fill coordinates when you pick on the map.">
            <Button variant="text">Help</Button>
          </Tooltip>
        </Box>

        {state.errors.nonField && (
          <Alert severity="error" sx={{ mb: 2 }}>{state.errors.nonField}</Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* BASIC INFO */}
          <Box sx={{ ...styles.section(theme), marginBottom: 2 }}>
            <Typography sx={styles.labelCaps}>Basic Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Property Title *"
                  name="title"
                  fullWidth
                  required
                  value={state.title}
                  onChange={(e) => dispatch({ type: "field", name: "title", value: e.target.value })}
                  error={Boolean(state.errors.title)}
                  helperText={state.errors.title}
                  sx={styles.field(theme)}
                />
              </Grid>

              {/* Quick UG Area + Address Geocode */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={styles.field(theme)}>
                  <InputLabel>Quick Select Area (Uganda)</InputLabel>
                  <Select
                    label="Quick Select Area (Uganda)"
                    value=""
                    onChange={(e) => jumpToUgArea(e.target.value)}
                    renderValue={() => ""}
                  >
                    {UG_AREAS.map((a) => (
                      <MenuItem key={a.label} value={a.label}>{a.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={styles.inline}>
                  <TextField
                    label="Address e.g. “Makindye, Lukuli Road”"
                    name="address"
                    fullWidth
                    value={state.address}
                    onChange={(e) => dispatch({ type: "field", name: "address", value: e.target.value })}
                    error={Boolean(state.errors.address)}
                    helperText={state.errors.address}
                    sx={styles.field(theme)}
                  />
                  <Button variant="outlined" onClick={geocodeAddress} disabled={state.geocoding} sx={{ whiteSpace: "nowrap" }}>
                    {state.geocoding ? "Locating…" : "Find on Map"}
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(state.errors.area)} sx={styles.field(theme)}>
                  <InputLabel>Area</InputLabel>
                  <Select
                    name="area"
                    label="Area"
                    value={state.area}
                    onChange={(e) => dispatch({ type: "field", name: "area", value: e.target.value })}
                  >
                    {AREA_CHOICES.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                  {state.errors.area && (
                    <Typography variant="caption" color="error">{state.errors.area}</Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Borough / Location *"
                  name="borough"
                  fullWidth
                  required
                  value={state.borough}
                  onChange={(e) => dispatch({ type: "field", name: "borough", value: e.target.value })}
                  error={Boolean(state.errors.borough)}
                  helperText={state.errors.borough}
                  sx={styles.field(theme)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(state.errors.listing_type)} sx={styles.field(theme)}>
                  <InputLabel>Listing Type</InputLabel>
                  <Select
                    name="listing_type"
                    label="Listing Type"
                    value={state.listing_type}
                    onChange={(e) => dispatch({ type: "field", name: "listing_type", value: e.target.value })}
                  >
                    {LISTING_TYPES.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                  {state.errors.listing_type && (
                    <Typography variant="caption" color="error">{state.errors.listing_type}</Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(state.errors.property_status)} sx={styles.field(theme)}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="property_status"
                    label="Status"
                    value={state.property_status}
                    onChange={(e) => dispatch({ type: "field", name: "property_status", value: e.target.value })}
                  >
                    {STATUS_CHOICES.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                  {state.errors.property_status && (
                    <Typography variant="caption" color="error">{state.errors.property_status}</Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(state.errors.rental_frequency)} sx={styles.field(theme)}>
                  <InputLabel>Rental Frequency</InputLabel>
                  <Select
                    name="rental_frequency"
                    label="Rental Frequency"
                    value={state.rental_frequency}
                    onChange={(e) => dispatch({ type: "field", name: "rental_frequency", value: e.target.value })}
                  >
                    {RENT_FREQ.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price (UGX / USD) *"
                  name="price"
                  type="number"
                  inputProps={{ min: 0, step: "any" }}
                  fullWidth
                  required
                  value={state.price}
                  onChange={(e) => dispatch({ type: "field", name: "price", value: e.target.value })}
                  error={Boolean(state.errors.price)}
                  helperText={state.errors.price}
                  sx={styles.field(theme)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Bedrooms"
                  name="bedrooms"
                  type="number"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={state.bedrooms}
                  onChange={(e) => dispatch({ type: "field", name: "bedrooms", value: e.target.value })}
                  sx={styles.field(theme)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Bathrooms"
                  name="bathrooms"
                  type="number"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={state.bathrooms}
                  onChange={(e) => dispatch({ type: "field", name: "bathrooms", value: e.target.value })}
                  sx={styles.field(theme)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Area Size (m²)"
                  name="area_size"
                  type="number"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={state.area_size}
                  onChange={(e) => dispatch({ type: "field", name: "area_size", value: e.target.value })}
                  sx={styles.field(theme)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description *"
                  name="description"
                  multiline
                  rows={5}
                  fullWidth
                  required
                  value={state.description}
                  onChange={(e) => dispatch({ type: "field", name: "description", value: e.target.value })}
                  error={Boolean(state.errors.description)}
                  helperText={state.errors.description}
                  sx={styles.field(theme)}
                />
              </Grid>
            </Grid>
          </Box>

          {/* MAP */}
          <Box sx={{ ...styles.section(theme), marginBottom: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={styles.labelCaps}>Location</Typography>
              <Typography variant="caption" color="text.secondary">
                Tip: click anywhere on the map to place the marker.
              </Typography>
            </Box>

            <Grid container spacing={1} sx={{ mb: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Latitude"
                  type="number"
                  value={state.latitude}
                  onChange={(e) => {
                    const lat = parseFloat(e.target.value);
                    if (Number.isFinite(lat)) dispatch({ type: "setLatLng", lat, lng: state.longitude });
                    else dispatch({ type: "field", name: "latitude", value: e.target.value });
                  }}
                  sx={styles.field(theme)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Longitude"
                  type="number"
                  value={state.longitude}
                  onChange={(e) => {
                    const lng = parseFloat(e.target.value);
                    if (Number.isFinite(lng)) dispatch({ type: "setLatLng", lat: state.latitude, lng });
                    else dispatch({ type: "field", name: "longitude", value: e.target.value });
                  }}
                  sx={styles.field(theme)}
                />
              </Grid>
            </Grid>

            {state.errors.latitude && (
              <Alert severity="warning" sx={{ mb: 1 }}>{state.errors.latitude}</Alert>
            )}

            <Box sx={styles.mapWrap(theme)} aria-label="Map showing property location">
              <MapContainer
                center={[state.latitude, state.longitude]}
                zoom={13}
                scrollWheelZoom
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <TheMapComponent onReady={(m) => dispatch({ type: "setMap", value: m })} />
                <ClickToPlaceMarker onSet={({ lat, lng }) => dispatch({ type: "setLatLng", lat, lng })} />
                <Marker draggable eventHandlers={eventHandlers} position={[state.latitude, state.longitude]} ref={markerRef} />
              </MapContainer>
            </Box>
            <Typography variant="caption" sx={styles.coords(theme)}>
              Lat: {Number(state.latitude).toFixed(6)} | Lng: {Number(state.longitude).toFixed(6)}
            </Typography>
          </Box>

          {/* IMAGES */}
          <Box sx={{ ...styles.section(theme), marginBottom: 2 }}>
            <Typography sx={styles.labelCaps}>Images</Typography>
            <Typography variant="caption" color="text.secondary">
              Main image recommended: 1600×900, &lt; 5MB (JPG/PNG/WEBP/GIF).
            </Typography>

            {state.errors.image_main && (
              <Alert severity="warning" sx={{ mt: 1 }}>{state.errors.image_main}</Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={styles.imageGrid(theme)}>
              <Box>
                <Button variant="outlined" component="label" fullWidth sx={styles.uploadPrimary(theme)}>
                  Upload Main Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    hidden
                    onChange={(e) => onImageMain(e.target.files?.[0] || null)}
                  />
                </Button>
                {state.imagePreview && (
                  <img src={state.imagePreview} alt="Main preview" style={styles.preview} />
                )}
              </Box>

              <Grid container spacing={1}>
                {["image_2", "image_3", "image_4"].map((name) => (
                  <Grid item xs={12} key={name}>
                    <Button variant="outlined" component="label" sx={styles.uploadStackBtn(theme)}>
                      {name.toUpperCase()}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        hidden
                        onChange={(e) =>
                          dispatch({
                            type: "file",
                            name,
                            value: e.target.files?.[0] || null,
                          })
                        }
                      />
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>

          <Button type="submit" fullWidth variant="contained" disabled={state.sending} sx={styles.submitBtn(theme)}>
            {state.sending ? "Submitting…" : "Submit Property"}
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={state.snackOpen}
        autoHideDuration={2200}
        onClose={() => dispatch({ type: "snack", value: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          Property submitted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
