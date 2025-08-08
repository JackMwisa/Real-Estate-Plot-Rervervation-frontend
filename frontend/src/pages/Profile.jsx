// src/pages/Profile.jsx
/// Profile page — auth-robust, non-destructive, with world-class UX polish
import React, { useEffect } from "react";
import { useImmerReducer } from "use-immer";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Axios from "axios";

/// MUI
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
} from "@mui/material";

/// Assets (same path you used before)
import defaultProfilePicture from "../assets/defaultProfilePicture.jpg";

/// Child component (you already have it)
import ProfileUpdate from "./ProfileUpdate";

/// ----------------------------------------
/// Config
/// ----------------------------------------
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const ME_URL = `${API_BASE}/api-auth-djoser/users/me/`;

/// Build auth header from whatever you stored (Token or JWT)
function getStoredAuth() {
  const tokenAuth = localStorage.getItem("auth_token"); // Djoser TokenAuth
  const jwtAccess = localStorage.getItem("access");     // Djoser JWT
  if (tokenAuth) return { token: tokenAuth, header: { Authorization: `Token ${tokenAuth}` } };
  if (jwtAccess)   return { token: jwtAccess, header: { Authorization: `Bearer ${jwtAccess}` } };
  return { token: "", header: {} };
}

/// ----------------------------------------
/// State
/// ----------------------------------------
const initialState = {
  loading: true,
  error: "",
  snack: { open: false, message: "", severity: "success" },

  /// current user (from /users/me/)
  me: null, // { id, username, email, ... }

  /// profile payload (from /api/profiles/:id/)
  profile: {
    agencyName: "",
    phoneNumber: "",
    profilePic: "",
    bio: "",
    sellerId: "",
    sellerListings: [], // array of listing ids (or objects – we just count)
  },
};

function reducer(draft, action) {
  switch (action.type) {
    case "loading":
      draft.loading = action.value;
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
      draft.profile.sellerId = p.seller ?? "";
      return;
    }
    default:
      return;
  }
}

/// ----------------------------------------
/// Component
/// ----------------------------------------
export default function Profile() {
  const [state, dispatch] = useImmerReducer(reducer, initialState);
  const navigate = useNavigate();

  /// Boot: ensure logged in, then fetch /me and profile
  useEffect(() => {
    const { token, header } = getStoredAuth();

    if (!token) {
      dispatch({ type: "error", value: "You must be logged in to view your profile." });
      navigate("/login");
      return;
    }

    const source = Axios.CancelToken.source();

    (async () => {
      try {
        dispatch({ type: "loading", value: true });

        /// 1) Who am I?
        const meRes = await Axios.get(ME_URL, {
          headers: { ...header },
          cancelToken: source.token,
        });
        dispatch({ type: "setMe", value: meRes.data });

        /// 2) Load profile by user id (same path shape you used before)
        const userId = meRes?.data?.id;
        if (!userId) throw new Error("Could not resolve your user ID.");

        const profileUrl = `${API_BASE}/api/profiles/${userId}/`;
        const profRes = await Axios.get(profileUrl, {
          headers: { ...header },
          cancelToken: source.token,
        });
        dispatch({ type: "setProfile", value: profRes.data });
        dispatch({ type: "error", value: "" });
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load your profile.";
        dispatch({ type: "error", value: msg });
      } finally {
        dispatch({ type: "loading", value: false });
      }
    })();

    return () => source.cancel();
  }, [navigate]);

  /// Helpers
  const hasProfileBasics =
    (state.profile.agencyName && state.profile.agencyName.trim() !== "") &&
    (state.profile.phoneNumber && state.profile.phoneNumber.trim() !== "");

  const listingsCount = Array.isArray(state.profile.sellerListings)
    ? state.profile.sellerListings.length
    : 0;

  const PropertiesChip = () => {
    if (listingsCount === 0) {
      return <Chip size="small" label="No Property" color="default" />;
    }
    if (listingsCount === 1) {
      return (
        <Button
          size="small"
          component={RouterLink}
          to={`/agencies/${state.profile.sellerId}`}
        >
          One Property listed
        </Button>
      );
    }
    return (
      <Button
        size="small"
        component={RouterLink}
        to={`/agencies/${state.profile.sellerId}`}
      >
        {listingsCount} Properties
      </Button>
    );
  };

  /// Loading state
  if (state.loading) {
    return (
      <Box sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm="auto">
              <Skeleton variant="circular" width={96} height={96} />
            </Grid>
            <Grid item xs={12} sm>
              <Skeleton variant="text" height={32} width="40%" />
              <Skeleton variant="text" height={24} width="60%" />
              <Skeleton variant="rectangular" height={18} width="30%" sx={{ mt: 1 }} />
            </Grid>
          </Grid>
          <Skeleton variant="rectangular" height={200} sx={{ mt: 3, borderRadius: 2 }} />
        </Paper>
      </Box>
    );
  }

  /// Main
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
      {/* Header Card */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Avatar
              src={state.profile.profilePic || defaultProfilePicture}
              alt={state.me?.username || "User"}
              sx={{ width: 96, height: 96, border: "2px solid rgba(0,0,0,0.1)" }}
            />
          </Grid>

          <Grid item xs={12} sm>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {state.me?.username ? `Welcome ${state.me.username}` : "Welcome"}
            </Typography>

            {hasProfileBasics ? (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                <Chip
                  label={state.profile.agencyName}
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={state.profile.phoneNumber}
                  variant="outlined"
                />
                <PropertiesChip />
              </Stack>
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                Please complete your profile below to unlock full functionality.
              </Typography>
            )}

            {state.profile.bio && (
              <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                {state.profile.bio}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm="auto">
            <Button
              variant="contained"
              onClick={() =>
                document
                  .getElementById("profile-update-section")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Profile Update Form (your component) */}
      <Box id="profile-update-section">
        <ProfileUpdate userProfile={state.profile} userId={state.me?.id} />
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
