import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, IconButton, Typography, Drawer, List,
  ListItem, ListItemText, Divider, Avatar, Badge, Menu, MenuItem,
  Tooltip, useTheme
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
  const isMenuOpen = Boolean(anchorEl);
  const theme = useTheme();

  const toggleDrawer = (open) => () => setDrawerOpen(open);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const drawerContent = (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      sx={{
        width: 250,
        height: '100%',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          px: 3,
          pt: 2,
          pb: 1,
          fontWeight: 600,
          color: theme.palette.mode === 'dark' ? '#fff' : '#222',
        }}
      >
        Navigation
      </Typography>
      <Divider />
      <List>
        {menuLinks.map((item) => (
          <ListItem
            key={item.label}
            button
            component={Link}
            to={item.path}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '1rem',
                fontWeight: 500,
                color: theme.palette.mode === 'dark' ? '#fff' : '#333',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: darkMode ? '#0a2540' : '#4CAF50', zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar className="px-4 py-2 flex justify-between items-center w-full">
          {/* Left: Logo + Hamburger */}
          <Box className="flex items-center gap-3">
            <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)} className="md:hidden" size="large">
              <MenuIcon />
            </IconButton>
            <Typography
              component={Link}
              to="/"
              className="no-underline text-white font-bold text-xl"
            >
              RealEstate
            </Typography>
          </Box>

          {/* Center: Search Bar */}
          <Box className="hidden sm:flex justify-center flex-grow max-w-md mx-auto">
            <Box className="w-full max-w-md">
              <Search className="w-full">
                <SearchIconWrapper>
                  <SearchIcon fontSize="small" />
                </SearchIconWrapper>
                <StyledInputBase placeholder="Search..." inputProps={{ 'aria-label': 'search' }} />
              </Search>
            </Box>
          </Box>

          {/* Right: Icons */}
          <Box className="flex items-center gap-3">
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

            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>

      {/* Avatar Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
        <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
      </Menu>
    </>
  );
}
