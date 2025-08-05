import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, IconButton, Typography, Button,
  Drawer, List, ListItem, ListItemText, Divider, Avatar, Badge, Menu, MenuItem,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle
} from '@mui/icons-material';
import { Search, SearchIconWrapper, StyledInputBase } from './NavbarStyle';

const menuLinks = [
  { label: 'Listings', path: '/listings' },
  { label: 'Agencies', path: '/agencies' },
  { label: 'Add Property', path: '/add-property' },
];

export default function Navbar({ darkMode, toggleDarkMode }) {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const drawerContent = (
    <Box role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)} className="w-64">
      <Typography variant="h6" className="p-4 font-semibold text-gray-800 dark:text-white">Navigation</Typography>
      <Divider />
      <List>
        {menuLinks.map((item) => (
          <ListItem button key={item.label} component={Link} to={item.path}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
        <Toolbar className="min-h-12 px-2 flex justify-between">
          {/* Left Section */}
          <Box className="flex items-center gap-2">
            <IconButton size="small" edge="start" color="inherit" onClick={toggleDrawer(true)}>
              <MenuIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              className="text-white no-underline font-semibold"
            >
              RealEstate
            </Typography>
          </Box>

          {/* Center Section - desktop links */}
          <Box className="hidden md:flex gap-4 items-center">
            {menuLinks.map((item) => (
              <Button key={item.label} color="inherit" component={Link} to={item.path}>
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Right Section */}
          <Box className="flex items-center gap-2">
            <Search>
              <SearchIconWrapper>
                <SearchIcon fontSize="small" />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
            </Search>

            <IconButton size="small" color="inherit">
              <Badge badgeContent={5} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>

            <IconButton size="small" onClick={handleMenuOpen}>
              <Avatar sx={{ width: 28, height: 28 }}>
                <AccountCircle fontSize="small" />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>

      {/* Account Dropdown Menu */}
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
