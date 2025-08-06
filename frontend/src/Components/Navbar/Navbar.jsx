import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Typography, Drawer, List,
  ListItem, ListItemText, Divider, Avatar, Badge, Menu, MenuItem,
  Tooltip, useTheme, Button, Box
} from '@mui/material';

import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  DarkMode,
  LightMode,
} from '@mui/icons-material';

import { Search, SearchIconWrapper, StyledInputBase } from './NavbarStyle';

const menuLinks = [
  { label: 'Listings', path: '/listings' },
  { label: 'Agencies', path: '/agencies' },
  { label: 'Add Property', path: '/add-property' },
];

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null); // 🧠 null = not logged in
  const isMenuOpen = Boolean(anchorEl);
  const theme = useTheme();

  const toggleDrawer = (open) => () => setDrawerOpen(open);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogin = () => setUser({ name: 'John Doe' });
  const handleLogout = () => {
    setUser(null);
    handleMenuClose();
  };

  const drawerContent = (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      sx={{
        width: 260,
        height: '100%',
        backgroundColor: theme.palette.background.paper,
      }}
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
        {!user && (
          <>
            <ListItem button component={Link} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/signup">
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: darkMode ? '#0a2540' : '#4CAF50',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
          {/* LEFT: Drawer Toggle + Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer(true)}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component={Link}
              to="/"
              sx={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.25rem',
                textDecoration: 'none',
              }}
            >
              RealEstate
            </Typography>
            {/* Desktop Menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, ml: 2 }}>
              {menuLinks.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{ color: '#fff', fontWeight: 600, textTransform: 'none' }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* CENTER: Search */}
          <Box sx={{ flex: 1, mx: 4, maxWidth: 400, display: { xs: 'none', sm: 'flex' } }}>
            <Search sx={{ width: '100%' }}>
              <SearchIconWrapper>
                <SearchIcon fontSize="small" />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
            </Search>
          </Box>

          {/* RIGHT: Icon buttons + Auth Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            {user ? (
              <IconButton onClick={handleMenuOpen} color="inherit">
                <Avatar sx={{ width: 32, height: 32 }}>
                  <AccountCircle />
                </Avatar>
              </IconButton>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  sx={{ color: '#fff', textTransform: 'none', fontWeight: 500 }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  sx={{
                    color: '#fff',
                    border: '1px solid white',
                    borderRadius: 3,
                    px: 2,
                    textTransform: 'none',
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
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
}
