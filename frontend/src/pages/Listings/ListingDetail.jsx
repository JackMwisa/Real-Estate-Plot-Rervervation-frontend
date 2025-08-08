import React, { useEffect, useMemo } from "react";
import { useImmerReducer } from "use-immer";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import Axios from "axios";

// React Leaflet
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for Leaflet (Vite/CRA)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Assets
import defaultProfilePicture from "../../assets/defaultProfilePicture.jpg";
import stadiumIconPng from "../../assets/Mapicons/stadium.png";
import hospitalIconPng from "../../assets/Mapicons/hospital.png";
import universityIconPng from "../../assets/Mapicons/university.png";

// Components
import ListingUpdate from "./ListingUpdate";

// MUI
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link,
  Dialog,
  Snackbar,
  Divider,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import RoomIcon from "@mui/icons-material/Room";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentsIcon from "@mui/icons-material/Payments";

// ---- Config ----
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const LISTING_URL = (id) => `${API_BASE}/api/listings/${id}/`;
const LISTING_DELETE_URL = (id) => `${API_BASE}/api/listings/${id}/delete/`;
const PROFILE_URL = (sellerId) => `${API_BASE}/api/profiles/${sellerId}/`;

// ---- Helpers ----
const poiIcon = (type) =>
  new Icon({
    iconUrl:
      type === "Stadium"
        ? stadiumIconPng
        : type === "Hospital"
        ? hospitalIconPng
        : universityIconPng,
    iconSize: [40, 40],
  });

const fmtMoney = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
    : n;

const priceLabel = (l) => {
  if (!l) return "";
  const price = fmtMoney(l.price);
  if (String(l.property_status).toLowerCase() === "sale") {
    return `${l.listing_type} • $${price}`;
  }
  const freq = l.rental_frequency ? `/${String(l.rental_frequency).toLowerCase()}` : "";
  return `${l.listing_type} • $${price}${freq}`;
};

// Haversine (km)
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const initialState = {
  loading: true,
  error: "",
  listing: null,
  seller: null,

  galleryIndex: 0,
  openUpdate: false,

  snack: { open: false, msg: "", severity: "success" },
  deleting: false,
};

function reducer(draft, action) {
  switch (action.type) {
    case "loading":
      draft.loading = action.value;
      return;
    case "error":
      draft.error = action.value || "";
      if (action.value) {
        draft.snack = { open: true, msg: action.value, severity: "error" };
      }
      return;
    case "setListing":
      draft.listing = action.value || null;
      return;
    case "setSeller":
      draft.seller = action.value || null;
      return;
    case "galleryIndex":
      draft.galleryIndex = action.value;
      return;
    case "openUpdate":
      draft.openUpdate = true;
      return;
    case "closeUpdate":
      draft.openUpdate = false;
      return;
    case "snack":
      draft.snack = { ...draft.snack, ...action.value };
      return;
    case "deleting":
      draft.deleting = action.value;
      return;
    default:
      return;
  }
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useImmerReducer(reducer, initialState);

  // Fetch listing then seller
  useEffect(() => {
    const source = Axios.CancelToken.source();
    (async () => {
      try {
        dispatch({ type: "loading", value: true });
        const res = await Axios.get(LISTING_URL(id), { cancelToken: source.token });
        dispatch({ type: "setListing", value: res.data });

        if (res.data?.seller != null) {
          const prof = await Axios.get(PROFILE_URL(res.data.seller), {
            cancelToken: source.token,
          });
          dispatch({ type: "setSeller", value: prof.data });
        }
        dispatch({ type: "error", value: "" });
      } catch (err) {
        const msg =
          err?.response?.data?.detail || err?.message || "Failed to load listing.";
        dispatch({ type: "error", value: msg });
      } finally {
        dispatch({ type: "loading", value: false });
      }
    })();
    return () => source.cancel();
  }, [id]);

  // Gallery images
  const gallery = useMemo(() => {
    if (!state.listing) return [];
    return [
      state.listing.picture1,
      state.listing.picture2,
      state.listing.picture3,
      state.listing.picture4,
      state.listing.picture5,
    ].filter(Boolean);
  }, [state.listing]);

  const nextImg = () =>
    dispatch({
      type: "galleryIndex",
      value: (state.galleryIndex + 1) % Math.max(1, gallery.length),
    });

  const prevImg = () =>
    dispatch({
      type: "galleryIndex",
      value:
        (state.galleryIndex - 1 + Math.max(1, gallery.length)) %
        Math.max(1, gallery.length),
    });

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      dispatch({ type: "deleting", value: true });
      const token = localStorage.getItem("auth_token");
      await Axios.delete(LISTING_DELETE_URL(id), {
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      dispatch({
        type: "snack",
        value: { open: true, msg: "Property deleted.", severity: "success" },
      });
      setTimeout(() => navigate("/listings"), 900);
    } catch (err) {
      dispatch({
        type: "snack",
        value: { open: true, msg: "Failed to delete property.", severity: "error" },
      });
    } finally {
      dispatch({ type: "deleting", value: false });
    }
  };

  // Loading skeleton
  if (state.loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/listings" underline="hover" color="inherit">
            Listings
          </Link>
          <Typography color="text.primary">Loading…</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Skeleton variant="rectangular" height={380} sx={{ borderRadius: 2 }} />
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="text" width="70%" height={36} />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rectangular" height={120} sx={{ mt: 2, borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }

  if (state.error || !state.listing) {
    return (
      <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, sm: 3 } }}>
        <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
          {state.error || "Listing not found."}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/listings")}>
          Back to Listings
        </Button>
      </Box>
    );
  }

  const l = state.listing;
  const postedAt = l.date_posted ? new Date(l.date_posted) : null;
  const postedLabel = postedAt
    ? postedAt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const pois = Array.isArray(l.listing_pois_within_10km) ? l.listing_pois_within_10km : [];

  // ----- Go to Payment -----
  const goToPayment = () => {
    // push to /pay carrying minimal info
    navigate("/pay", {
      state: {
        listingId: l.id,
        title: l.title,
        amount: Number(l.price) || 0,
        currency: l.property_status?.toLowerCase() === "sale" ? "USD" : "USD",
        meta: {
          listing_type: l.listing_type,
          property_status: l.property_status,
          rental_frequency: l.rental_frequency,
        },
      },
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 }, pb: 10 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/listings">
          Listings
        </Link>
        <Typography color="text.primary">{l.title}</Typography>
      </Breadcrumbs>

      {/* Gallery */}
      {gallery.length > 0 && (
        <Box
          sx={{
            position: "relative",
            borderRadius: 2,
            overflow: "hidden",
            height: { xs: 280, sm: 360, md: 420 },
            mb: 2,
          }}
        >
          <img
            src={gallery[state.galleryIndex]}
            alt={l.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {gallery.length > 1 && (
            <>
              <IconButton
                onClick={prevImg}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 12,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,.4)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,.6)" },
                }}
                aria-label="Previous image"
              >
                <ArrowBackIosNewIcon />
              </IconButton>
              <IconButton
                onClick={nextImg}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 12,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,.4)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,.6)" },
                }}
                aria-label="Next image"
              >
                <ArrowForwardIosIcon />
              </IconButton>

              {/* Thumbs */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: "rgba(0,0,0,.35)",
                  p: 0.5,
                  borderRadius: 2,
                }}
              >
                {gallery.map((src, i) => (
                  <Box
                    key={src + i}
                    onClick={() => dispatch({ type: "galleryIndex", value: i })}
                    sx={{
                      width: 52,
                      height: 40,
                      borderRadius: 1,
                      overflow: "hidden",
                      outline: i === state.galleryIndex ? "2px solid #fff" : "none",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={src}
                      alt={`thumb-${i}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Box>
      )}

      {/* Top meta + price + CTA */}
      <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {l.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
              <RoomIcon fontSize="small" />
              <Typography variant="body1">{l.borough}</Typography>
              {postedLabel && <Chip size="small" label={postedLabel} sx={{ ml: 1 }} />}
            </Stack>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{ textAlign: { xs: "left", md: "right" }, display: "flex", gap: 1, justifyContent: { xs: "flex-start", md: "flex-end" } }}
          >
            <Chip color="success" label={priceLabel(l)} sx={{ fontWeight: 700, fontSize: 16 }} />
            <Button startIcon={<PaymentsIcon />} variant="contained" color="primary" onClick={goToPayment}>
              Reserve / Pay
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Features */}
      <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {l.rooms ? <Chip label={`${l.rooms} Rooms`} /> : null}
          {l.bedrooms ? <Chip label={`${l.bedrooms} Beds`} /> : null}
          {l.bathrooms ? <Chip label={`${l.bathrooms} Baths`} /> : null}
          {l.area_size ? <Chip label={`${l.area_size} m²`} /> : null}
          {l.furnished ? <Chip icon={<CheckCircleIcon color="success" />} label="Furnished" /> : null}
          {l.pool ? <Chip icon={<CheckCircleIcon color="success" />} label="Pool" /> : null}
          {l.elevator ? <Chip icon={<CheckCircleIcon color="success" />} label="Elevator" /> : null}
          {l.cctv ? <Chip icon={<CheckCircleIcon color="success" />} label="CCTV" /> : null}
          {l.parking ? <Chip icon={<CheckCircleIcon color="success" />} label="Parking" /> : null}
        </Stack>
      </Paper>

      {/* Description */}
      {l.description && (
        <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Description
          </Typography>
          <Typography variant="body1">{l.description}</Typography>
        </Paper>
      )}

      {/* Seller card + owner actions */}
      <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Card sx={{ width: 200 }}>
              <CardMedia
                component="img"
                height="120"
                image={state.seller?.profile_picture || defaultProfilePicture}
                alt={state.seller?.agency_name || "Agency"}
                sx={{ objectFit: "cover", cursor: "pointer" }}
                onClick={() => navigate(`/agencies/${state.seller?.seller ?? l.seller}`)}
              />
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {state.seller?.agency_name || "Agency"}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
                  {state.seller?.phone_number ? (
                    <Chip
                      icon={<LocalPhoneIcon />}
                      label={
                        <a href={`tel:${state.seller.phone_number}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {state.seller.phone_number}
                        </a>
                      }
                      variant="outlined"
                      size="small"
                    />
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs>
            <Typography variant="body2" color="text.secondary">
              Contact the agency directly for viewing or more details. You can also reserve the property now to secure it.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button size="small" onClick={() => navigate(`/agencies/${state.seller?.seller ?? l.seller}`)}>
                View Agency
              </Button>
            </Stack>
          </Grid>

          {/* Owner-only actions */}
          {String(localStorage.getItem("auth_user_id") || "") === String(l.seller ?? "") && (
            <Grid item xs={12} sm="auto">
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={() => dispatch({ type: "openUpdate" })}>
                  Update
                </Button>
                <Button variant="contained" color="error" disabled={state.deleting} onClick={handleDelete}>
                  {state.deleting ? "Deleting…" : "Delete"}
                </Button>
              </Stack>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Map + POIs */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="stretch">
          {/* POI list */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Nearby Places (within 10km)
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {pois.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No nearby places registered.
              </Typography>
            ) : (
              <Stack spacing={1} sx={{ maxHeight: 420, overflow: "auto" }}>
                {pois.map((poi) => {
                  const lat = poi?.location?.coordinates?.[0];
                  const lng = poi?.location?.coordinates?.[1];
                  const km =
                    lat != null && lng != null && l.latitude != null && l.longitude != null
                      ? distanceKm(l.latitude, l.longitude, lat, lng).toFixed(2)
                      : null;

                  return (
                    <Paper key={poi.id} sx={{ p: 1, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {poi.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {poi.type}
                        {km ? (
                          <>
                            {" "}
                            • <b style={{ color: "green" }}>{km} km</b>
                          </>
                        ) : null}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Grid>

          {/* Map */}
          <Grid item xs={12} md={8}>
            <Box sx={{ borderRadius: 2, overflow: "hidden", height: 420 }}>
              {l.latitude != null && l.longitude != null ? (
                <MapContainer center={[l.latitude, l.longitude]} zoom={14} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
                  <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[l.latitude, l.longitude]}>
                    <Popup>{l.title}</Popup>
                  </Marker>

                  {pois.map((poi) => {
                    const lat = poi?.location?.coordinates?.[0];
                    const lng = poi?.location?.coordinates?.[1];
                    if (lat == null || lng == null) return null;
                    return (
                      <Marker key={poi.id} position={[lat, lng]} icon={poiIcon(poi.type)}>
                        <Popup>{poi.name}</Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              ) : (
                <Box sx={{ p: 2 }}>
                  <Alert severity="warning">This listing has no valid coordinates.</Alert>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Update dialog */}
      <Dialog open={state.openUpdate} onClose={() => dispatch({ type: "closeUpdate" })} fullScreen>
        <ListingUpdate listingData={l} closeDialog={() => dispatch({ type: "closeUpdate" })} />
      </Dialog>

      {/* Bottom sticky payment bar */}
      <Paper
        elevation={6}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          p: 1.5,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 2,
          justifyContent: "center",
          zIndex: 1200,
        }}
      >
        <Chip color="success" label={priceLabel(l)} sx={{ fontWeight: 700 }} />
        <Button
          startIcon={<PaymentsIcon />}
          variant="contained"
          color="primary"
          size="large"
          onClick={goToPayment}
        >
          Reserve / Pay
        </Button>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={state.snack.open}
        autoHideDuration={2200}
        onClose={() => dispatch({ type: "snack", value: { open: false } })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => dispatch({ type: "snack", value: { open: false } })}
          severity={state.snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {state.snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
