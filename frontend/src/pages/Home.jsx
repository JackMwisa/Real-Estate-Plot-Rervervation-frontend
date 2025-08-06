import React from 'react';
import { Box, Button, Container, Grid, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import city from '../assets/city.jpg';

const Home = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '60vh', md: '75vh' },
          backgroundImage: `url(${city})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.6)',
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            px: 2,
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Find Your Dream Property
          </Typography>
          <Typography variant="h6" mb={3}>
            Explore the best listings in your area today.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            to="/listings"
            sx={{ px: 4, py: 1.5 }}
          >
            Browse Listings
          </Button>
        </Box>
      </Box>

      {/* Why Choose Us */}
      <Box
        sx={{
          py: 6,
          backgroundColor: isDark ? '#0f172a' : '#f9f9f9',
        }}
      >
        <Container>
          <Typography
            variant="h4"
            fontWeight="bold"
            align="center"
            mb={4}
            color={isDark ? '#fff' : '#111'}
          >
            Why Choose Us
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                title: 'Verified Listings',
                description: 'All our properties are thoroughly vetted to ensure trust and reliability.',
              },
              {
                title: 'Expert Support',
                description: 'Our support team is always ready to help you make the right move.',
              },
              {
                title: 'Best Prices',
                description: 'We offer competitive and transparent pricing for all listings.',
              },
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center', px: 2 }}>
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
          backgroundColor: isDark ? '#1e293b' : '#e8f5e9',
          color: isDark ? '#fff' : '#333',
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={2}>
          Ready to List Your Property?
        </Typography>
        <Typography variant="body1" mb={3}>
          Join our growing platform and showcase your property to thousands of potential buyers and renters.
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/add-property"
          sx={{ px: 4, py: 1.5 }}
        >
          Add Property
        </Button>
      </Box>
    </>
  );
};

export default Home;
