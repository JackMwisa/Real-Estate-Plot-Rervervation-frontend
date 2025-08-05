import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, IconButton, Typography, Drawer, List,
  ListItem, ListItemText, Divider, Avatar, Badge, Menu, MenuItem,
  Tooltip, useTheme, Button
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
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: darkMode ? '#0a2540' : '#4CAF50',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            px: 2,
          }}
        >
          {/* Left: Logo & Drawer */}
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

            {/* Desktop Menu Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, ml: 2 }}>
              {menuLinks.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Center: Search */}
          <Box sx={{ flex: 1, maxWidth: 400, display: { xs: 'none', sm: 'flex' } }}>
            <Search sx={{ width: '100%' }}>
              <SearchIconWrapper>
                <SearchIcon fontSize="small" />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
            </Search>
          </Box>

          {/* Right: Icons */}
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

            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>

      {/* User menu */}
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
