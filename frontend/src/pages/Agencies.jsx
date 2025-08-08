// src/pages/Agencies.jsx
// World-class Agencies index: fast, responsive, with search/filter, solid error/empty states.
import React, { useEffect, useMemo } from "react";
import { useImmerReducer } from "use-immer";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Axios from "axios";

// MUI
import {
  Box,
  Grid,
  Paper,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Skeleton,
  Alert,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import BusinessIcon from "@mui/icons-material/Business";
import ApartmentIcon from "@mui/icons-material/Apartment";

// If you have a local fallback image, adjust the import/path:
import defaultProfilePicture from "../assets/defaultProfilePicture.jpg";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const AGENCIES_URL = `${API_BASE}/api/profiles/`;

const PAGE_SIZE = 12;

const initialState = {
  loading: true,
  error: "",
  agencies: [],
  query: "",
  page: 1,
};

function reducer(draft, action) {
  switch (action.type) {
    case "loading":
      draft.loading = action.value;
      return;
    case "error":
      draft.error = action.value || "";
      return;
    case "setAgencies":
      draft.agencies = action.value || [];
      return;
    case "setQuery":
      draft.query = action.value;
      draft.page = 1; // reset to first page on new search
      return;
    case "setPage":
      draft.page = action.value;
      return;
    default:
      return;
  }
}

export default function Agencies() {
  const [state, dispatch] = useImmerReducer(reducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    const source = Axios.CancelToken.source();
    (async () => {
      try {
        dispatch({ type: "loading", value: true });
        const res = await Axios.get(AGENCIES_URL, { cancelToken: source.token });
        dispatch({ type: "setAgencies", value: res.data });
        dispatch({ type: "error", value: "" });
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load agencies.";
        dispatch({ type: "error", value: msg });
      } finally {
        dispatch({ type: "loading", value: false });
      }
    })();
    return () => source.cancel();
  }, []);

  // Filter agencies that have the basics and match query
  const filtered = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    return (state.agencies || [])
      .filter((a) => a?.agency_name && a?.phone_number)
      .filter((a) =>
        q
          ? (a.agency_name || "").toLowerCase().includes(q) ||
            (a.bio || "").toLowerCase().includes(q) ||
            (a.seller_username || "").toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => {
        // Sort by most listings desc, then agency name asc
        const ac = Array.isArray(a.seller_listings) ? a.seller_listings.length : 0;
        const bc = Array.isArray(b.seller_listings) ? b.seller_listings.length : 0;
        if (bc !== ac) return bc - ac;
        return String(a.agency_name || "").localeCompare(String(b.agency_name || ""));
      });
  }, [state.agencies, state.query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (state.page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, state.page]);

  const LoadingGrid = () => (
    <Grid container spacing={2}>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${i}`}>
          <Card>
            <Skeleton variant="rectangular" height={140} />
            <CardContent>
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="rectangular" height={18} sx={{ mt: 1 }} />
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Skeleton variant="rounded" width={120} height={36} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const PropertiesChip = ({ count, sellerId }) => {
    if (!count) return <Chip size="small" label="No Property" />;
    const label = count === 1 ? "One Property" : `${count} Properties`;
    return (
      <Button
        size="small"
        variant="outlined"
        onClick={() => navigate(`/agencies/${sellerId}`)}
      >
        {label}
      </Button>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 1,
            alignItems: "center",
            rowGap: 2,
            columnGap: 2,
            mb: 1,
            ...(theme) => ({
              [theme.breakpoints.up("sm")]: {
                gridTemplateColumns: "1fr 320px",
              },
            }),
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
              <BusinessIcon fontSize="medium" />
              Agencies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discover trusted agencies. Click through to see their active listings.
            </Typography>
          </Box>

          <TextField
            value={state.query}
            onChange={(e) => dispatch({ type: "setQuery", value: e.target.value })}
            placeholder="Search agencies, bios, or usernames…"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      {state.error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {state.error}
        </Alert>
      )}

      {state.loading ? (
        <LoadingGrid />
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No agencies found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try clearing your search or check back later.
          </Typography>
          <Button component={RouterLink} to="/add-property" variant="contained">
            List a Property
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            {pageItems.map((agency) => {
              const listings = Array.isArray(agency.seller_listings)
                ? agency.seller_listings
                : [];
              const listingsCount = listings.length;
              const img = agency.profile_picture || defaultProfilePicture;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`agency-${agency.id ?? agency.seller}`}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardActionArea onClick={() => navigate(`/agencies/${agency.seller}`)}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={img}
                        alt={agency.agency_name || "Agency"}
                        sx={{ objectFit: "cover" }}
                        loading="lazy"
                      />
                      <CardContent>
                        <Stack spacing={0.5}>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {agency.agency_name || "Unnamed Agency"}
                          </Typography>

                          {agency.bio && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {agency.bio}
                            </Typography>
                          )}

                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                            <Chip
                              size="small"
                              icon={<PhoneIphoneIcon />}
                              label={agency.phone_number}
                              variant="outlined"
                            />
                            {agency.seller_username && (
                              <Chip
                                size="small"
                                icon={<ApartmentIcon />}
                                label={agency.seller_username}
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Stack>
                      </CardContent>
                    </CardActionArea>

                    <CardActions sx={{ mt: "auto", px: 2, pb: 2 }}>
                      <PropertiesChip
                        count={listingsCount}
                        sellerId={agency.seller}
                      />
                      <Button
                        size="small"
                        component={RouterLink}
                        to={`/agencies/${agency.seller}`}
                        sx={{ ml: "auto" }}
                      >
                        View Agency
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {pageCount > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={pageCount}
                page={state.page}
                onChange={(_, p) => dispatch({ type: "setPage", value: p })}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
