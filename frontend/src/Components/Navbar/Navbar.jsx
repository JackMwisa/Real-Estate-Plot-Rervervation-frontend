// components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, IconButton, Typography, Button,
  useTheme, Switch,
} from '@mui/material';
import { Search, SearchIconWrapper, StyledInputBase } from './NavbarStyle';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar({ darkMode, toggleDarkMode }) {
  const theme = useTheme();

  return (
    <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
      <Toolbar className="min-h-12 px-2 flex justify-between">
        {/* Left Section */}
        <Box className="flex items-center gap-2">
          <IconButton size="small" edge="start" color="inherit">
            <MenuIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            className="text-white no-underline"
          >
            RealEstate
          </Typography>
        </Box>

        {/* Center Section */}
        <Box className="hidden md:flex gap-4 items-center">
          <Button color="inherit" component={Link} to="/listings">Listings</Button>
          <Button color="inherit" component={Link} to="/agencies">Agencies</Button>
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/add-property"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Add Property
          </Button>
        </Box>

        {/* Right Section */}
        <Box className="flex items-center gap-2">
          <Search>
            <SearchIconWrapper>
              <SearchIcon fontSize="small" />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
          </Search>
          <Switch checked={darkMode} onChange={toggleDarkMode} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
