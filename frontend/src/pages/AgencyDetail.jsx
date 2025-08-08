
import React, { useEffect } from "react";
import { useImmerReducer } from "use-immer";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import Axios from "axios";

// MUI
import {
  Box,
  Paper,
  Grid,
  Typography,
  Avatar,
  Chip,
  Stack,
  Skeleton,
  Alert,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import BusinessIcon from "@mui/icons-material/Business";
import ApartmentIcon from "@mui/icons-material/Apartment";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Fallback image
import defaultProfilePicture from "../assets/defaultProfilePicture.jpg";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const PROFILE_URL = (sellerId) => `${API_BASE}/api/profiles/${sellerId}/`;

const initialState = {
  loading: true,
  error: "",
  profile: {
    agency_name: "",
    phone_number: "",
    profile_picture: "",
    bio: "",
    seller: null,
    seller_username: "",
    seller_listings: [], // listing objects from your serializer
  },
};

function reducer(draft, action) {
  switch (action.type) {
    case "loading":
      draft.loading = action.value;
      return;
    case "error":
      draft.error = action.value || "";
      return;
    case "setProfile":
      draft.profile = { ...draft.profile, ...(action.value || {}) };
      return;
    default:
      return;
  }
}

// helpers
const formatPrice = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
    : n;

const listingPriceLabel = (l) => {
  const price = formatPrice(l?.price);
  if (!l) return "";
  if (String(l?.property_status).toLowerCase() === "sale") {
    return `${l?.listing_type ?? "Property"} • $${price}`;
  }
  const freq = l?.rental_frequency ? `/${String(l.rental_frequency).toLowerCase()}` : "";
  return `${l?.listing_type ?? "Property"} • $${price}${freq}`;
};

export default function AgencyDetail() {
  const { id } = useParams(); // seller id (User.id) per your urls.py
  const navigate = useNavigate();
  const [state, dispatch] = useImmerReducer(reducer, initialState);

  useEffect(() => {
    const source = Axios.CancelToken.source();
    (async () => {
      try {
        dispatch({ type: "loading", value: true });
        const res = await Axios.get(PROFILE_URL(id), { cancelToken: source.token });
        dispatch({ type: "setProfile", value: res.data });
        dispatch({ type: "error", value: "" });
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load agency details.";
        dispatch({ type: "error", value: msg });
      } finally {
        dispatch({ type: "loading", value: false });
      }
    })();
    return () => source.cancel();
  }, [id]);

  const HeaderSkeleton = () => (
    <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Skeleton variant="circular" width={96} height={96} />
        </Grid>
        <Grid item xs>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="text" width="60%" height={22} />
          <Skeleton variant="rectangular" height={18} width="30%" sx={{ mt: 1 }} />
        </Grid>
      </Grid>
    </Paper>
  );

  const ListingsSkeleton = () => (
    <Grid container spacing={2}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={`sk-${i}`}>
          <Card>
            <Skeleton variant="rectangular" height={160} />
            <CardContent>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Skeleton variant="rounded" width={140} height={36} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const profile = state.profile;
  const listings = Array.isArray(profile.seller_listings) ? profile.seller_listings : [];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}>
      {/* Back + Title Row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Tooltip title="Back">
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h5" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
          <BusinessIcon /> Agency
        </Typography>
      </Box>

      {/* Error */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {state.error}
        </Alert>
      )}

      {/* Header */}
      {state.loading ? (
        <HeaderSkeleton />
      ) : (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                src={profile.profile_picture || defaultProfilePicture}
                alt={profile.agency_name || "Agency"}
                sx={{ width: 96, height: 96, border: "2px solid rgba(0,0,0,0.1)" }}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {profile.agency_name || "Unnamed Agency"}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, flexWrap: "wrap" }}>
                {profile.phone_number ? (
                  <>
                    <Chip
                      icon={<LocalPhoneIcon />}
                      label={
                        <a
                          href={`tel:${profile.phone_number}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {profile.phone_number}
                        </a>
                      }
                      variant="outlined"
                    />
                    <Button
                      size="small"
                      startIcon={<LocalPhoneIcon />}
                      sx={{ textTransform: "none" }}
                      component="a"
                      href={`tel:${profile.phone_number}`}
                    >
                      Call
                    </Button>
                  </>
                ) : (
                  <Chip icon={<InfoOutlinedIcon />} label="No phone number" variant="outlined" />
                )}
                {profile.seller_username && (
                  <Chip icon={<ApartmentIcon />} label={profile.seller_username} variant="outlined" />
                )}
                <Chip
                  color="primary"
                  label={`${listings.length} ${listings.length === 1 ? "Listing" : "Listings"}`}
                />
              </Stack>
              {profile.bio && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {profile.bio}
                </Typography>
              )}
            </Grid>

            {/* Optional: avoid linking to same page */}
            {profile.seller && String(profile.seller) !== String(id) && (
              <Grid item xs="auto">
                <Button
                  variant="contained"
                  component={RouterLink}
                  to={`/agencies/${profile.seller}`}
                >
                  View All
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* Listings */}
      {state.loading ? (
        <ListingsSkeleton />
      ) : listings.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No listings yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This agency hasn’t posted any properties.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {listings.map((l) => {
            const cover =
              l.picture1 || l.picture2 || l.picture3 || l.picture4 || defaultProfilePicture;
            const priceText = listingPriceLabel(l);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`listing-${l.id}`}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                  <CardActionArea onClick={() => navigate(`/listings/${l.id}`)}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={cover}
                      alt={l.title || "Listing"}
                      sx={{ objectFit: "cover" }}
                      loading="lazy"
                    />
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {l.title || "Untitled Listing"}
                      </Typography>
                      {l.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {l.description}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>

                  {/* Quick “fly to” style affordance if you later place a mini-map here */}
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "#fff",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.06)" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/listings/${l.id}`);
                    }}
                  >
                    <RoomIcon color="primary" />
                  </IconButton>

                  <CardActions sx={{ mt: "auto", px: 2, pb: 2, gap: 1 }}>
                    <Chip label={priceText} color="default" />
                    <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/listings/${l.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/pay/${l.id}`)}
                      >
                        Reserve / Pay
                      </Button>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}