import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  IconButton,
} from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';

// Icons
import houseIconPng from '../../assets/Mapicons/house.png';
import apartmentIconPng from '../../assets/Mapicons/apartment.png';
import officeIconPng from '../../assets/Mapicons/office.png';

// Data
import myListings from '../../assets/Data/Dummydata';

const iconMap = {
  House: new Icon({ iconUrl: houseIconPng, iconSize: [35, 35] }),
  Apartment: new Icon({ iconUrl: apartmentIconPng, iconSize: [35, 35] }),
  Office: new Icon({ iconUrl: officeIconPng, iconSize: [35, 35] }),
};

const Listings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [view, setView] = useState('standard');
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const baseLayers = {
    standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.png",
  };

  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      mapRef.current = map;
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
      
      return () => {
        mapRef.current = null;
      };
    }, [map]);

    return null;
  };

  const handleFlyTo = (coordinates) => {
    if (mapRef.current) {
      mapRef.current.flyTo(coordinates, 15);
    }
  };

  // Calculate initial center based on listings if available
  const initialCenter = myListings.length > 0 
    ? myListings[0].location.coordinates 
    : [51.505, -0.09];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column-reverse' : 'row', 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* Listings Sidebar */}
      <Box sx={{
        width: isMobile ? '100%' : '40%',
        height: isMobile ? '40%' : '100%',
        overflowY: 'auto',
        padding: 2,
        backgroundColor: theme.palette.grey[100],
        borderRight: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
      }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Browse Listings
        </Typography>

        <Box sx={{ marginBottom: '1rem' }}>
          <Button
            onClick={() => setView('standard')}
            variant={view === 'standard' ? 'contained' : 'outlined'}
            sx={{ mr: 1 }}
          >
            Standard View
          </Button>
          <Button
            onClick={() => setView('satellite')}
            variant={view === 'satellite' ? 'contained' : 'outlined'}
          >
            Satellite View
          </Button>
        </Box>

        <Box sx={{ overflowY: 'auto', height: isMobile ? 'calc(100% - 100px)' : 'calc(100% - 100px)' }}>
          {myListings.map((listing) => (
            <Card key={listing.id} sx={{ 
              marginBottom: 2,
              position: 'relative',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.01)',
                boxShadow: theme.shadows[4],
              },
            }}>
              <CardMedia
                component="img"
                height="160"
                image={listing.picture1}
                alt={listing.title}
                onClick={() => handleFlyTo(listing.location.coordinates)}
                sx={{ cursor: 'pointer', objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6">{listing.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {listing.description.substring(0, 100)}...
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="green"
                  fontWeight="bold"
                  mt={1}
                >
                  {listing.property_status === 'Rent'
                    ? `$${listing.price} / ${listing.rental_frequency}`
                    : `$${listing.price.toLocaleString()}`}
                </Typography>
              </CardContent>
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: '#fff',
                  zIndex: 1,
                  '&:hover': {
                    background: theme.palette.grey[200],
                  },
                }}
                onClick={() => handleFlyTo(listing.location.coordinates)}
              >
                <RoomIcon color="primary" />
              </IconButton>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Map Container */}
      <Box sx={{
        width: isMobile ? '100%' : '60%',
        height: isMobile ? '60%' : '100%',
        position: 'relative',
      }}>
        <Box sx={{ 
          height: '100%', 
          width: '100%',
          position: 'relative',
        }}>
          <MapContainer
            center={initialCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ 
              height: '100%', 
              width: '100%',
              zIndex: 1,
            }}
            whenCreated={(map) => {
              mapRef.current = map;
              setTimeout(() => map.invalidateSize(), 100);
            }}
          >
            <MapController />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={baseLayers[view]}
            />
            {myListings.map((listing) => (
              <Marker
                key={listing.id}
                position={listing.location.coordinates}
                icon={iconMap[listing.listing_type] || iconMap.House}
              >
                <Popup>
                  <Typography variant="h6">{listing.title}</Typography>
                  <img
                    src={listing.picture1}
                    alt={listing.title}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      margin: '0.5rem 0',
                    }}
                  />
                  <Typography variant="body2">
                    {listing.description.substring(0, 100)}...
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    View Details
                  </Button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Listings;