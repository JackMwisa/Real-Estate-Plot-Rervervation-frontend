// Footer.jsx
import React from 'react';
import { Box, Container, Typography, Divider, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { FooterWrapper, FooterLink } from './FooterStyle';

export default function Footer({ darkMode }) {
  const theme = useTheme();

  return (
    <FooterWrapper component="footer">
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            RealEstate
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            <FooterLink component={Link} to="/about">About</FooterLink>
            <FooterLink component={Link} to="/contact">Contact</FooterLink>
            <FooterLink component={Link} to="/privacy">Privacy Policy</FooterLink>
          </Box>
        </Box>

        <Divider sx={{ backgroundColor: darkMode ? '#334155' : '#ccc', mb: 2 }} />

        <Typography variant="body2" align="center" sx={{ color: darkMode ? '#ccc' : '#666' }}>
          © {new Date().getFullYear()} RealEstate. All rights reserved.
        </Typography>
      </Container>
    </FooterWrapper>
  );
}
