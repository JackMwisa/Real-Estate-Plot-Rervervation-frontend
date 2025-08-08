// src/components/Navbar.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Axios from "axios";

/// MUI
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  Button,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";

/// MUI Icons
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  DarkMode,
  LightMode,
} from "@mui/icons-material";

/// Styled search parts (your existing styles)
import { Search, SearchIconWrapper, StyledInputBase } from "./NavbarStyle";

/// ----------------------------------------
/// API endpoints (kept your structure)
/// ----------------------------------------
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const ME_URL = `${API_BASE}/api-auth-djoser/users/me/`;
const LOGOUT_URL = `${API_BASE}/api-auth-djoser/token/logout/`;
const PROFILE_URL = (userId) => `${API_BASE}/api/profiles/${userId}/`; // your urls.py expects <int:seller>

/// Main menu links (unchanged)
const menuLinks = [
  { label: "Listings", path: "/listings" },
  { label: "Agencies", path: "/agencies" },
  { label: "Add Property", path: "/add-property" },
];

export default function Navbar({ darkMode, toggleDarkMode }) {
  /// ----------------------------------------
  /// Local state
  /// ----------------------------------------
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const [user, setUser] = useState(null); // { username, email, id, profile_picture? } | null
  const [loggingOut, setLoggingOut] = useState(false);

  /// Feedback
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");

  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  /// ----------------------------------------
  /// Helpers
  /// ----------------------------------------
  const toggleDrawer = (open) => () => setDrawerOpen(open);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const closeSnack = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackOpen(false);
  };

  const performLocalLogout = useCallback(async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_username");
    localStorage.removeItem("auth_email");
    localStorage.removeItem("auth_user_id");
    localStorage.removeItem("auth_profile_pic");
    setUser(null);
    setAnchorEl(null);
  }, []);

  /// Fetch profile (for profile_picture)
  const fetchProfileForPic = useCallback(async (id, token) => {
    if (!id || !token) return null;
    try {
      const res = await Axios.get(PROFILE_URL(id), {
        headers: { Authorization: `Token ${token}` },
      });
      const pic = res?.data?.profile_picture || "";
      // merge into state + cache for instant next paint
      setUser((prev) =>
        prev ? { ...prev, profile_picture: pic } : { id, profile_picture: pic }
      );
      localStorage.setItem("auth_profile_pic", pic || "");
      return pic;
    } catch {
      // silently ignore if profile not found yet
      return null;
    }
  }, []);

  /// ----------------------------------------
  /// Boot: hydrate user from cache, then verify with backend
  /// Re-run on route change so navbar stays in sync post-auth/profile update.
  /// ----------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setUser(null);
      return;
    }

    // Instant paint from cache
    const cachedUsername = localStorage.getItem("auth_username");
    const cachedEmail = localStorage.getItem("auth_email");
    const cachedId = localStorage.getItem("auth_user_id");
    const cachedPic = localStorage.getItem("auth_profile_pic");
    if (cachedUsername) {
      setUser({
        username: cachedUsername,
        email: cachedEmail || "",
        id: cachedId ? Number(cachedId) : undefined,
        profile_picture: cachedPic || "",
      });
    }

    // Verify / refresh data from backend
    const source = Axios.CancelToken.source();
    (async () => {
      try {
        // 1) Who am I?
        const meRes = await Axios.get(ME_URL, {
          headers: { Authorization: `Token ${token}` },
          cancelToken: source.token,
        });

        const me = meRes.data;
        setUser((prev) => ({ ...prev, ...me }));

        // Cache base user fields
        localStorage.setItem("auth_username", me.username || "");
        localStorage.setItem("auth_email", me.email || "");
        localStorage.setItem("auth_user_id", String(me.id ?? ""));

        // 2) Pull profile picture (from Profile model)
        await fetchProfileForPic(me.id, token);
      } catch {
        // expired/invalid token → clear & bounce softly
        await performLocalLogout();
        navigate("/login");
      }
    })();

    return () => source.cancel();
  }, [location.pathname, fetchProfileForPic, navigate, performLocalLogout]);

  /// ----------------------------------------
  /// Logout (calls Djoser, then clears locally)
  /// ----------------------------------------
  const handleLogout = useCallback(async () => {
    if (loggingOut) return; // guard double click
    setAnchorEl(null);

    const confirm = window.confirm("Are you sure you want to log out?");
    if (!confirm) return;

    const token = localStorage.getItem("auth_token");
    try {
      setLoggingOut(true);

      if (token) {
        await Axios.post(LOGOUT_URL, null, {
          headers: { Authorization: `Token ${token}` },
        });
      }

      await performLocalLogout();

      setSnackSeverity("success");
      setSnackMsg("You have successfully logged out!");
      setSnackOpen(true);

      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch {
      await performLocalLogout();

      setSnackSeverity("warning");
      setSnackMsg("Logged out locally. Server session may persist.");
      setSnackOpen(true);

      setTimeout(() => {
        navigate("/login");
      }, 800);
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut, navigate, performLocalLogout]);

  /// Drawer (side menu) content
  const drawerContent = (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      sx={{ width: 260, height: "100%", backgroundColor: theme.palette.background.paper }}
    >
      <Typography variant="h6" sx={{ px: 3, pt: 2, pb: 1, fontWeight: 600 }}>
        Navigation
      </Typography>
      <Divider />
      <List>
        {menuLinks.map((item) => (
          <ListItem key={item.label} button component={Link} to={item.path}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        {!user ? (
          <>
            <ListItem button component={Link} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/signup">
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem>
              <ListItemText primary={`Hello, ${user.username || "User"}`} />
            </ListItem>
            <ListItem button onClick={handleLogout} disabled={loggingOut}>
              <ListItemText primary={loggingOut ? "Logging out..." : "Logout"} />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  /// ----------------------------------------
  /// Render
  /// ----------------------------------------
  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: darkMode ? "#0a2540" : "#4CAF50",
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
          {/* LEFT: Drawer Toggle + Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer(true)}
              sx={{ display: { xs: "block", md: "none" } }}
              aria-label="open navigation"
            >
              <MenuIcon />
            </IconButton>

            <Typography
              component={Link}
              to="/"
              sx={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1.25rem",
                textDecoration: "none",
              }}
            >
              RealEstate
            </Typography>

            {/* Desktop Menu */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, ml: 2 }}>
              {menuLinks.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{ color: "#fff", fontWeight: 600, textTransform: "none" }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* CENTER: Search */}
          <Box sx={{ flex: 1, mx: 4, maxWidth: 480, display: { xs: "none", sm: "flex" } }}>
            <Search sx={{ width: "100%" }}>
              <SearchIconWrapper>
                <SearchIcon fontSize="small" />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ "aria-label": "search" }} />
            </Search>
          </Box>

          {/* RIGHT: Icons + Auth */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton color="inherit" aria-label="notifications">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            {user ? (
              <>
                <Typography sx={{ color: "#fff", mr: 1 }}>
                  {user.username || "User"}
                </Typography>
                <IconButton
                  onClick={handleMenuOpen}
                  color="inherit"
                  aria-label="account menu"
                  aria-controls={isMenuOpen ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen ? "true" : undefined}
                >
                  {/* ✅ Show profile picture if we have it, else fallback icon */}
                  <Avatar
                    src={user.profile_picture || ""}
                    alt={user.username || "User"}
                    sx={{ width: 32, height: 32 }}
                  >
                    {!user.profile_picture && <AccountCircle />}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  sx={{ color: "#fff", textTransform: "none", fontWeight: 500 }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  sx={{
                    color: "#fff",
                    border: "1px solid white",
                    borderRadius: 3,
                    px: 2,
                    textTransform: "none",
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>

      {/* Dropdown Menu */}
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
          Profile
        </MenuItem>
        <MenuItem component={Link} to="/settings" onClick={handleMenuClose}>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out..." : "Logout"}
        </MenuItem>
      </Menu>

      {/* Snackbar (feedback) */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnack} severity={snackSeverity} variant="filled" sx={{ width: "100%" }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
