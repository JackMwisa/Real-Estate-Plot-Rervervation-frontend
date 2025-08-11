import React, { useEffect, useMemo } from "react";
import { useImmerReducer } from "use-immer";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Axios from "axios";

// MUI
import {
  Box,
  Paper,
  Grid,
  Typography,
  Avatar,
  Button,
  Chip,
  Stack,
  Skeleton,
  Snackbar,
  Alert,
  Divider,
  Tooltip,
  IconButton,
  alpha,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import BusinessIcon from "@mui/icons-material/Business";

// Assets
import defaultProfilePicture from "../assets/defaultProfilePicture.jpg";

// Child
import ProfileUpdate from "./ProfileUpdate";

// ----------------------------------------
// Config
// ----------------------------------------
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const ME_URL = `${API_BASE}/api-auth-djoser/users/me/`;

// Auth header from localStorage (Token or JWT)
function getStoredAuth() {
  const tokenAuth = localStorage.getItem("auth_token"); // Djoser TokenAuth
  const jwtAccess = localStorage.getItem("access");     // Djoser JWT
  if (tokenAuth) return { token: tokenAuth, header: { Authorization: `Token ${tokenAuth}` } };
  if (jwtAccess)   return { token: jwtAccess, header: { Authorization: `Bearer ${jwtAccess}` } };
  return { token: "", header: {} };
}

// ----------------------------------------
// State
// ----------------------------------------
const initialState = {
  loading: true,
  refreshing: false,
  error: "",
  snack: { open: false, message: "", severity: "success" },

  me: null, // { id, username, email, ... }

  profile: {
    agencyName: "",
    phoneNumber: "",
    profilePic: "",
    bio: "",
    sellerId: "",
    sellerListings: [],
  },
};

function reducer(draft, action) {
  switch (action.type) {
    case "loading":
      draft.loading = action.value;
      return;
    case "refreshing":
      draft.refreshing = action.value;
      return;
    case "error":
      draft.error = action.value || "";
      if (draft.error) {
        draft.snack = { open: true, message: draft.error, severity: "error" };
      }
      return;
    case "snack":
      draft.snack = { ...draft.snack, ...action.value };
      return;
    case "setMe":
      draft.me = action.value;
      return;
    case "setProfile": {
      const p = action.value || {};
      draft.profile.agencyName = p.agency_name ?? "";
      draft.profile.phoneNumber = p.phone_number ?? "";
      draft.profile.profilePic = p.profile_picture ?? "";
      draft.profile.bio = p.bio ?? "";
      draft.profile.sellerListings = p.seller_listings ?? [];
      draft.profile.sellerId = p.seller ?? p?.seller_id ?? "";
      return;
    }
    default:
      return;
  }
}

// ----------------------------------------
// Component
// ----------------------------------------
export default function Profile() {
  const [state, dispatch] = useImmerReducer(reducer, initialState);
  const navigate = useNavigate();
  const auth = useMemo(() => getStoredAuth(), []);

  // Unified fetcher (initial + refresh)
  async function fetchAll({ isRefresh = false } = {}) {
    const source = Axios.CancelToken.source();
    try {
      if (isRefresh) dispatch({ type: "refreshing", value: true });
      else dispatch({ type: "loading", value: true });

      if (!auth.token) throw new Error("You must be logged in to view your profile.");

      // 1) /users/me/
      const meRes = await Axios.get(ME_URL, {
        headers: { ...auth.header },
        cancelToken: source.token,
      });
      dispatch({ type: "setMe", value: meRes.data });

      const userId = meRes?.data?.id;
      if (!userId) throw new Error("Could not resolve your user ID.");

      // 2) /api/profiles/:id/
      const profileUrl = `${API_BASE}/api/profiles/${userId}/`;
      const profRes = await Axios.get(profileUrl, {
        headers: { ...auth.header },
        cancelToken: source.token,
      });
      dispatch({ type: "setProfile", value: profRes.data });
      dispatch({ type: "error", value: "" });
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to load your profile.";

      if (status === 401 || status === 403) {
        dispatch({ type: "error", value: "Please log in to view your profile." });
        navigate("/login");
      } else {
        dispatch({ type: "error", value: msg });
      }
    } finally {
      if (isRefresh) dispatch({ type: "refreshing", value: false });
      else dispatch({ type: "loading", value: false });
    }
    return () => source.cancel();
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived
  const listingsCount = Array.isArray(state.profile.sellerListings)
    ? state.profile.sellerListings.length
    : 0;

  const hasProfileBasics =
    (state.profile.agencyName && state.profile.agencyName.trim() !== "") &&
    (state.profile.phoneNumber && state.profile.phoneNumber.trim() !== "");

  // UI helpers
  const gradientBg = (theme) =>
    theme.palette.mode === "dark"
      ? `linear-gradient(135deg, ${alpha("#0ea5e9", 0.15)} 0%, ${alpha(
          "#14b8a6",
          0.12
        )} 100%)`
      : `linear-gradient(135deg, ${alpha("#4CAF50", 0.08)} 0%, ${alpha(
          "#2196F3",
          0.08
        )} 100%)`;

  const PropertiesLink = () => {
    if (!state.profile.sellerId || listingsCount === 0) {
      return <Chip size="small" label="No Property" color="default" />;
    }
    const label = listingsCount === 1 ? "1 Property" : `${listingsCount} Properties`;
    return (
      <Button
        size="small"
        component={RouterLink}
        to={`/agencies/${state.profile.sellerId}`}
        startIcon={<ApartmentIcon fontSize="small" />}
      >
        {label}
      </Button>
    );
  };

  const HeaderActions = () => (
    <Stack direction="row" spacing={1}>
      <Tooltip title="Refresh">
        <span>
          <IconButton
            onClick={() => fetchAll({ isRefresh: true })}
            disabled={state.refreshing}
            aria-label="refresh profile"
          >
            <RefreshIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Button
        startIcon={<EditIcon />}
        variant="contained"
        onClick={() =>
          document
            .getElementById("profile-update-section")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      >
        Edit Profile
      </Button>
    </Stack>
  );

  // Loading
  if (state.loading) {
    return (
      <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, sm: 3 } }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm="auto">
              <Skeleton variant="circular" width={96} height={96} />
            </Grid>
            <Grid item xs={12} sm>
              <Skeleton variant="text" height={32} width="45%" />
              <Skeleton variant="text" height={22} width="65%" />
              <Skeleton variant="text" height={18} width="35%" sx={{ mt: 1 }} />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
        </Paper>
      </Box>
    );
  }

  // Main
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, sm: 3 } }}>
      {/* Header Card */}
      <Paper
        sx={(theme) => ({
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          mb: 3,
          backgroundImage: gradientBg(theme),
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        })}
        elevation={0}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Avatar
              src={state.profile.profilePic || defaultProfilePicture}
              alt={state.me?.username || "User"}
              sx={{
                width: 96,
                height: 96,
                border: "2px solid rgba(0,0,0,0.08)",
                bgcolor: "background.default",
              }}
              imgProps={{
                onError: (e) => {
                  e.currentTarget.src = defaultProfilePicture;
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
              {state.me?.username ? `Welcome, ${state.me.username}` : "Welcome"}
            </Typography>
            {state.me?.email && (
              <Typography variant="body2" color="text.secondary">
                {state.me.email}
              </Typography>
            )}

            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1 }}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              {hasProfileBasics ? (
                <>
                  <Chip
                    icon={<BusinessIcon />}
                    label={state.profile.agencyName}
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    icon={<PhoneIphoneIcon />}
                    label={state.profile.phoneNumber}
                    variant="outlined"
                  />
                  <PropertiesLink />
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 1, width: "100%" }}>
                  Add your <strong>Agency name</strong> and <strong>Phone number</strong> below to
                  unlock all features (like adding properties).
                </Alert>
              )}
            </Stack>

            {state.profile.bio && (
              <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary" }}>
                {state.profile.bio}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm="auto">
            <HeaderActions />
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats (optional lightweight section) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              p: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            })}
          >
            <Typography variant="overline" color="text.secondary">
              Properties
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {listingsCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              p: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            })}
          >
            <Typography variant="overline" color="text.secondary">
              Account
            </Typography>
            <Typography variant="body1">
              {state.me?.email || "—"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Profile Update Form */}
      <Box id="profile-update-section">
        <ProfileUpdate
          userProfile={{
            agency_name: state.profile.agencyName,
            phone_number: state.profile.phoneNumber,
            profile_picture: state.profile.profilePic,
            bio: state.profile.bio,
            seller_listings: state.profile.sellerListings,
            seller: state.profile.sellerId,
          }}
          userId={state.me?.id}
          onSaved={() => {
            dispatch({
              type: "snack",
              value: { open: true, severity: "success", message: "Profile updated." },
            });
            fetchAll({ isRefresh: true });
          }}
        />
      </Box>

      {/* Feedback */}
      <Snackbar
        open={state.snack.open}
        autoHideDuration={3000}
        onClose={() => dispatch({ type: "snack", value: { open: false } })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => dispatch({ type: "snack", value: { open: false } })}
          severity={state.snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {state.snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
