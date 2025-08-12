// src/components/NotificationBell.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Axios from "axios";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
  Divider,
  Box,
  Button,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const LIST_URL = `${API_BASE}/api/notifications/`;
const UNREAD_URL = `${API_BASE}/api/notifications/unread-count/`;
const MARK_READ_URL = (id) => `${API_BASE}/api/notifications/${id}/read/`;

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => localStorage.getItem("auth_token") || "", []);

  const authHeader = token ? { Authorization: `Token ${token}` } : undefined;

  const fetchUnread = useCallback(async () => {
    if (!token) return setUnread(0);
    try {
      const { data } = await Axios.get(UNREAD_URL, { headers: authHeader });
      // Support either { unread_count } or { unread }
      const value =
        typeof data?.unread_count === "number"
          ? data.unread_count
          : typeof data?.unread === "number"
          ? data.unread
          : 0;
      setUnread(value);
    } catch {
      setUnread(0);
    }
  }, [token]);

  const fetchList = useCallback(async () => {
    if (!token) return setItems([]);
    setLoading(true);
    try {
      const { data } = await Axios.get(LIST_URL, {
        headers: authHeader,
        params: { page: 1, page_size: 10 },
      });
      // Handle paginated { results: [...] } and non-paginated [...]
      setItems(Array.isArray(data) ? data : data?.results ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUnread();
    // Poll every 45s (you can switch to WebSockets later)
    const id = setInterval(fetchUnread, 45000);
    return () => clearInterval(id);
  }, [fetchUnread]);

  const handleOpen = async (e) => {
    setAnchorEl(e.currentTarget);
    await fetchList();
  };

  const handleClose = () => setAnchorEl(null);

  const markRead = async (id) => {
    if (!token) return;
    try {
      await Axios.post(MARK_READ_URL(id), null, { headers: authHeader });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    const unreadItems = items.filter((n) => !n.is_read);
    await Promise.all(unreadItems.map((n) => markRead(n.id)));
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" aria-label="notifications" onClick={handleOpen}>
          <Badge badgeContent={unread} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 360, maxWidth: "90vw" } }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          {!!items.length && (
            <Button size="small" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {loading && (
          <Box sx={{ px: 2, py: 3, display: "flex", gap: 1, alignItems: "center" }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Loading…
            </Typography>
          </Box>
        )}

        {!loading && !items.length && (
          <Box sx={{ px: 2, py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {token ? "You're all caught up!" : "Sign in to see notifications."}
            </Typography>
          </Box>
        )}

        {!loading &&
          items.map((n) => {
            const href = n.url || undefined;
            return (
              <MenuItem
                key={n.id}
                component={href ? "a" : "div"}
                href={href}
                onClick={(e) => {
                  // If it has a URL, let the browser navigate, but still mark read
                  if (!href) e.preventDefault();
                  if (!n.is_read) markRead(n.id);
                  if (href) handleClose();
                }}
                sx={{ alignItems: "flex-start", gap: 1.25, opacity: n.is_read ? 0.7 : 1 }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={n.is_read ? 400 : 700}>
                      {n.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                    </Typography>
                  }
                />
                {!n.is_read && (
                  <Box sx={{ ml: "auto" }}>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        markRead(n.id);
                      }}
                    >
                      Read
                    </Button>
                  </Box>
                )}
              </MenuItem>
            );
          })}
      </Menu>
    </>
  );
}
