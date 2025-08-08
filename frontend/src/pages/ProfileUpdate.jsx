// src/pages/ProfileUpdate.jsx
/// ProfileUpdate — robust userId resolution + auth headers + image validation
import React, { useEffect } from "react";
import { useImmerReducer } from "use-immer";
import Axios from "axios";
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";

/// --- Config
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const PROFILE_UPDATE_URL = (userId) => `${API_BASE}/api/profiles/${userId}/update/`;
const ME_URL = `${API_BASE}/api-auth-djoser/users/me/`;

/// Build auth header from storage
function getStoredAuth() {
  const tokenAuth = localStorage.getItem("auth_token"); // Djoser TokenAuth
  const jwtAccess = localStorage.getItem("access");     // Djoser JWT
  if (tokenAuth) return { token: tokenAuth, header: { Authorization: `Token ${tokenAuth}` } };
  if (jwtAccess)   return { token: jwtAccess, header: { Authorization: `Bearer ${jwtAccess}` } };
  return { token: "", header: {} };
}

export default function ProfileUpdate({ userProfile = {}, userId: userIdProp }) {
  const initialState = {
    // form values
    agencyName: userProfile.agencyName ?? "",
    phoneNumber: userProfile.phoneNumber ?? "",
    bio: userProfile.bio ?? "",
    profilePicCurrent: userProfile.profilePic ?? null,

    // file
    uploadedFile: null,
    uploadedFilePreview: null,
    fileError: "",

    // resolved user id to update
    effectiveUserId: userIdProp ?? userProfile.sellerId ?? null,

    // ui
    sending: false,
    snack: { open: false, msg: "", severity: "success" },
    errors: {}, // { field: "message" }
  };

  function reducer(draft, action) {
    switch (action.type) {
      case "field":
        draft[action.name] = action.value;
        if (draft.errors[action.name]) delete draft.errors[action.name];
        return;
      case "file":
        draft.uploadedFile = action.value;
        return;
      case "filePreview":
        draft.uploadedFilePreview = action.value;
        return;
      case "fileError":
        draft.fileError = action.value || "";
        return;
      case "errors":
        draft.errors = action.value || {};
        return;
      case "snack":
        draft.snack = { ...draft.snack, ...action.value };
        return;
      case "setUserId":
        draft.effectiveUserId = action.value ?? null;
        return;
      case "sending":
        draft.sending = action.value;
        return;
      default:
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(reducer, initialState);

  /// Resolve user ID on mount (props → localStorage → /users/me/)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (state.effectiveUserId) return; // already set from props

      // try localStorage from your Navbar pattern
      const cached = localStorage.getItem("auth_user_id");
      if (cached && !Number.isNaN(Number(cached))) {
        if (!cancelled) dispatch({ type: "setUserId", value: Number(cached) });
        return;
      }

      // fallback: call /users/me/
      const { header, token } = getStoredAuth();
      if (!token) return; // no token; leave null so submit will show error

      try {
        const res = await Axios.get(ME_URL, { headers: { ...header } });
        const id = res?.data?.id;
        if (!cancelled && id) {
          dispatch({ type: "setUserId", value: id });
          // cache for later so other pages can reuse
          localStorage.setItem("auth_user_id", String(id));
        }
      } catch {
        // ignore; submit will warn if still missing
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /// Simple validation
  const validate = () => {
    const e = {};
    if (!String(state.agencyName).trim()) e.agencyName = "Agency name is required";
    if (!String(state.phoneNumber).trim()) e.phoneNumber = "Phone number is required";
    return e;
  };

  /// Handle image file
  const onPickFile = (file) => {
    dispatch({ type: "fileError", value: "" });
    dispatch({ type: "file", value: null });
    dispatch({ type: "filePreview", value: null });

    if (!file) return;
    const isImage =
      file.type.startsWith("image/") &&
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type);
    const isOKSize = file.size <= 5 * 1024 * 1024; // 5MB

    if (!isImage) {
      dispatch({ type: "fileError", value: "Only JPG/PNG/WEBP/GIF allowed." });
      return;
    }
    if (!isOKSize) {
      dispatch({ type: "fileError", value: "Max size is 5MB." });
      return;
    }

    dispatch({ type: "file", value: file });
    const reader = new FileReader();
    reader.onloadend = () => dispatch({ type: "filePreview", value: reader.result });
    reader.readAsDataURL(file);
  };

  /// Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      dispatch({ type: "errors", value: errs });
      return;
    }

    if (!state.effectiveUserId) {
      dispatch({
        type: "snack",
        value: { open: true, severity: "error", msg: "Missing user ID. Please re-login and try again." },
      });
      return;
    }

    dispatch({ type: "sending", value: true });

    const fd = new FormData();
    fd.append("agency_name", state.agencyName);
    fd.append("phone_number", state.phoneNumber);
    fd.append("bio", state.bio);
    fd.append("seller", state.effectiveUserId);
    if (state.uploadedFile) {
      fd.append("profile_picture", state.uploadedFile);
    }

    try {
      const { header } = getStoredAuth();
      await Axios.patch(PROFILE_UPDATE_URL(state.effectiveUserId), fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...header,
        },
      });

      dispatch({
        type: "snack",
        value: { open: true, severity: "success", msg: "Profile updated successfully!" },
      });
      // clear file preview (keep text fields visible)
      dispatch({ type: "file", value: null });
      dispatch({ type: "filePreview", value: null });
      dispatch({ type: "fileError", value: "" });
    } catch (err) {
      const data = err?.response?.data || {};
      const mapped = {};
      Object.keys(data).forEach((k) => {
        mapped[k] = Array.isArray(data[k]) ? data[k][0] : String(data[k]);
      });
      dispatch({ type: "errors", value: mapped });
      dispatch({
        type: "snack",
        value: { open: true, severity: "error", msg: "Failed to update profile." },
      });
    } finally {
      dispatch({ type: "sending", value: false });
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3} md={2}>
              <Avatar
                src={state.uploadedFilePreview || state.profilePicCurrent || undefined}
                alt="Profile"
                sx={{ width: 88, height: 88, border: "2px solid rgba(0,0,0,0.1)" }}
              />
            </Grid>

            <Grid item xs={12} sm={9} md={10}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                My Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep your agency details up to date.
              </Typography>
              {!state.effectiveUserId && (
                <Typography variant="caption" color="error">
                  Trying to resolve user… (log in again if this doesn’t disappear)
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Agency Name *"
                name="agencyName"
                fullWidth
                value={state.agencyName}
                onChange={(e) => dispatch({ type: "field", name: "agencyName", value: e.target.value })}
                error={Boolean(state.errors.agencyName)}
                helperText={state.errors.agencyName}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Phone Number *"
                name="phoneNumber"
                fullWidth
                value={state.phoneNumber}
                onChange={(e) => dispatch({ type: "field", name: "phoneNumber", value: e.target.value })}
                error={Boolean(state.errors.phoneNumber)}
                helperText={state.errors.phoneNumber}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Bio"
                name="bio"
                fullWidth
                multiline
                rows={5}
                value={state.bio}
                onChange={(e) => dispatch({ type: "field", name: "bio", value: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <Button variant="outlined" component="label" fullWidth>
                {state.uploadedFile ? "Change Profile Picture" : "Upload Profile Picture"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                />
              </Button>
              {state.fileError && (
                <Typography variant="caption" color="error">
                  {state.fileError}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={state.sending || !state.effectiveUserId}
              >
                {state.sending ? "Updating…" : "Update"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={state.snack.open}
        autoHideDuration={2500}
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
