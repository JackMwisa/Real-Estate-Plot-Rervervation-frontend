
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Axios from "axios";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Divider,
  Box,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const LIST_URL = `${API_BASE}/api/notifications/`;                 // GET (paginated allowed)
const UNREAD_URL = `${API_BASE}/api/notifications/unread-count/`;  // GET { unread: n }
const MARK_READ_URL = (id) => `${API_BASE}/api/notifications/${id}/read/`; // POST

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => localStorage.getItem("auth_token") || "", []);

  const fetchUnread = useCallback(async () => {
    if (!token) return setUnread(0);
    try {
      const { data } = await Axios.get(UNREAD_URL, {
        headers: { Authorization: `Token ${token}` },
      });
      setUnread(data?.unread ?? 0);
    } catch {
      setUnread(0);
    }
  }, [token]);

  const fetchList = useCallback(async () => {
    if (!token) return setItems([]);
    setLoading(true);
    try {
      const { data } = await Axios.get(LIST_URL, {
        headers: { Authorization: `Token ${token}` },
        params: { page: 1, page_size: 10 },
      });
      setItems(data?.results ?? data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUnread();
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
      await Axios.post(MARK_READ_URL(id), null, {
        headers: { Authorization: `Token ${token}` },
      });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {}
  };

  const markAllRead = async () => {
    await Promise.all(items.filter((n) => !n.is_read).map((n) => markRead(n.id)));
  };

  return (
    <>
      <IconButton color="inherit" aria-label="notifications" onClick={handleOpen}>
        <Badge badgeContent={unread} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 360, maxWidth: "90vw" } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          {!!items.length && (
            <Button size="small" onClick={markAllRead}>Mark all read</Button>
          )}
        </Box>
        <Divider />

        {!loading && !items.length && (
          <Box sx={{ px: 2, py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {token ? "You're all caught up!" : "Sign in to see notifications."}
            </Typography>
          </Box>
        )}

        {items.map((n) => (
          <MenuItem
            key={n.id}
            component={n.url ? "a" : "div"}
            href={n.url || undefined}
            onClick={(e) => {
              if (!n.url) e.preventDefault();
              if (!n.is_read) markRead(n.id);
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
              <ListItemSecondaryAction>
                <Button size="small" onClick={(e) => { e.preventDefault(); markRead(n.id); }}>
                  Read
                </Button>
              </ListItemSecondaryAction>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
