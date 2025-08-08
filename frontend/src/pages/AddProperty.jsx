// src/pages/AddProperty.jsx
import React, { useEffect, useMemo, useRef } from "react";
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
} from "@mui/material";

// Map
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons in Leaflet + Vite
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

const initialState = {
  // form
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
  // map
  latitude: 0.313, // Kampala-ish default
  longitude: 32.581,
  mapInstance: null,

  // images
  image_main: null,
  image_2: null,
  image_3: null,
  image_4: null,
  imagePreview: null,

  // ui
  errors: {},
  sending: false,
  snackOpen: false,

  // auth
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
    default:
      return;
  }
}

function TheMapComponent({ onReady }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

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
    []
  );

  const validate = () => {
    const e = {};
    if (!state.title.trim()) e.title = "Title is required";
    if (!state.area) e.area = "Area is required";
    if (!state.borough.trim()) e.borough = "Borough/Location is required";
    if (!state.listing_type) e.listing_type = "Listing type is required";
    if (!state.property_status) e.property_status = "Status is required";
    if (!state.price || Number(state.price) <= 0) e.price = "Enter a valid price";
    if (!state.description.trim()) e.description = "Description is required";
    if (state.latitude == null || state.longitude == null) {
      e.latitude = "Pick a location on the map";
    }
    return e;
  };

  const onImageMain = (file) => {
    dispatch({ type: "file", name: "image_main", value: file || null });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => dispatch({ type: "setPreview", value: reader.result });
      reader.readAsDataURL(file);
    } else {
      dispatch({ type: "setPreview", value: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eobj = validate();
    if (Object.keys(eobj).length) {
      dispatch({ type: "errors", value: eobj });
      return;
    }
    if (!state.token) {
      dispatch({
        type: "errors",
        value: { nonField: "You must be logged in to add a property." },
      });
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
      // reset form (keep map position)
      dispatch({
        type: "errors",
        value: {},
      });
      dispatch({ type: "field", name: "title", value: "" });
      dispatch({ type: "field", name: "area", value: "" });
      dispatch({ type: "field", name: "borough", value: "" });
      dispatch({ type: "field", name: "listing_type", value: "" });
      dispatch({ type: "field", name: "property_status", value: "available" });
      dispatch({ type: "field", name: "rental_frequency", value: "" });
      dispatch({ type: "field", name: "price", value: "" });
      dispatch({ type: "field", name: "description", value: "" });
      dispatch({ type: "field", name: "bedrooms", value: "" });
      dispatch({ type: "field", name: "bathrooms", value: "" });
      dispatch({ type: "field", name: "area_size", value: "" });
      onImageMain(null);
      dispatch({ type: "file", name: "image_2", value: null });
      dispatch({ type: "file", name: "image_3", value: null });
      dispatch({ type: "file", name: "image_4", value: null });
    } catch (err) {
      const data = err?.response?.data || {};
      const mapped = {};
      for (const k of Object.keys(data)) {
        mapped[k] = Array.isArray(data[k]) ? data[k][0] : String(data[k]);
      }
      mapped.nonField ||= "Failed to create listing.";
      dispatch({ type: "errors", value: mapped });
    } finally {
      dispatch({ type: "sending", value: false });
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: 4, backgroundColor: theme.palette.background.paper }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Add New Property
        </Typography>

        {state.errors.nonField && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.errors.nonField}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Property Title"
                name="title"
                fullWidth
                required
                value={state.title}
                onChange={(e) =>
                  dispatch({ type: "field", name: "title", value: e.target.value })
                }
                error={Boolean(state.errors.title)}
                helperText={state.errors.title}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={Boolean(state.errors.area)}>
                <InputLabel>Area</InputLabel>
                <Select
                  name="area"
                  label="Area"
                  value={state.area}
                  onChange={(e) =>
                    dispatch({ type: "field", name: "area", value: e.target.value })
                  }
                >
                  {AREA_CHOICES.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
                {state.errors.area && (
                  <Typography variant="caption" color="error">
                    {state.errors.area}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Borough / Location"
                name="borough"
                fullWidth
                required
                value={state.borough}
                onChange={(e) =>
                  dispatch({ type: "field", name: "borough", value: e.target.value })
                }
                error={Boolean(state.errors.borough)}
                helperText={state.errors.borough}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={Boolean(state.errors.listing_type)}>
                <InputLabel>Listing Type</InputLabel>
                <Select
                  name="listing_type"
                  label="Listing Type"
                  value={state.listing_type}
                  onChange={(e) =>
                    dispatch({ type: "field", name: "listing_type", value: e.target.value })
                  }
                >
                  {LISTING_TYPES.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
                {state.errors.listing_type && (
                  <Typography variant="caption" color="error">
                    {state.errors.listing_type}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={Boolean(state.errors.property_status)}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="property_status"
                  label="Status"
                  value={state.property_status}
                  onChange={(e) =>
                    dispatch({
                      type: "field",
                      name: "property_status",
                      value: e.target.value,
                    })
                  }
                >
                  {STATUS_CHOICES.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
                {state.errors.property_status && (
                  <Typography variant="caption" color="error">
                    {state.errors.property_status}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(state.errors.rental_frequency)}>
                <InputLabel>Rental Frequency</InputLabel>
                <Select
                  name="rental_frequency"
                  label="Rental Frequency"
                  value={state.rental_frequency}
                  onChange={(e) =>
                    dispatch({
                      type: "field",
                      name: "rental_frequency",
                      value: e.target.value,
                    })
                  }
                >
                  {RENT_FREQ.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Price (USD)"
                name="price"
                type="number"
                fullWidth
                required
                value={state.price}
                onChange={(e) =>
                  dispatch({ type: "field", name: "price", value: e.target.value })
                }
                error={Boolean(state.errors.price)}
                helperText={state.errors.price}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Bedrooms"
                name="bedrooms"
                type="number"
                fullWidth
                value={state.bedrooms}
                onChange={(e) =>
                  dispatch({ type: "field", name: "bedrooms", value: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Bathrooms"
                name="bathrooms"
                type="number"
                fullWidth
                value={state.bathrooms}
                onChange={(e) =>
                  dispatch({ type: "field", name: "bathrooms", value: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Area Size (m²)"
                name="area_size"
                type="number"
                fullWidth
                value={state.area_size}
                onChange={(e) =>
                  dispatch({ type: "field", name: "area_size", value: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                multiline
                rows={4}
                fullWidth
                required
                value={state.description}
                onChange={(e) =>
                  dispatch({
                    type: "field",
                    name: "description",
                    value: e.target.value,
                  })
                }
                error={Boolean(state.errors.description)}
                helperText={state.errors.description}
              />
            </Grid>

            {/* Map */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Drag the marker to set the property location
              </Typography>
              {!state.latitude && !state.longitude ? (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  Pick a location on the map
                </Alert>
              ) : null}
              <Box sx={{ height: 360, borderRadius: 1, overflow: "hidden" }}>
                <MapContainer
                  center={[state.latitude, state.longitude]}
                  zoom={13}
                  scrollWheelZoom
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <TheMapComponent
                    onReady={(m) => dispatch({ type: "setMap", value: m })}
                  />
                  <Marker
                    draggable
                    eventHandlers={eventHandlers}
                    position={[state.latitude, state.longitude]}
                    ref={markerRef}
                  />
                </MapContainer>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Lat: {state.latitude.toFixed(6)} | Lng: {state.longitude.toFixed(6)}
              </Typography>
            </Grid>

            {/* Images */}
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Upload Images
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" component="label" fullWidth>
                    Upload Main Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => onImageMain(e.target.files?.[0])}
                    />
                  </Button>
                  {state.imagePreview && (
                    <Box mt={2}>
                      <img
                        src={state.imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          borderRadius: 8,
                        }}
                      />
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Grid container spacing={1}>
                    {["image_2", "image_3", "image_4"].map((name) => (
                      <Grid item xs={12} key={name}>
                        <Button variant="outlined" component="label" fullWidth>
                          {name.toUpperCase()}
                          <input
                            type="file"
                            accept="image/*"
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
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={state.sending}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: theme.palette.mode === "dark" ? "#0ea5e9" : "#4CAF50",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#0284c7" : "#43a047",
                  },
                }}
              >
                {state.sending ? "Submitting…" : "Submit Property"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={state.snackOpen}
        autoHideDuration={2000}
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
