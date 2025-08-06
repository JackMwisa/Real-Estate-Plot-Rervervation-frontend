import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Grid, Card, CardMedia, CardContent, Typography, IconButton, Button } from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';

// Icons
import houseIconPng from '../assets/Mapicons/house.png';
import apartmentIconPng from '../assets/Mapicons/apartment.png';
import officeIconPng from '../assets/Mapicons/office.png';

// Data
import myListings from '../assets/Data/Dummydata';

const iconMap = {
  House: new Icon({ iconUrl: houseIconPng, iconSize: [35, 35] }),
  Apartment: new Icon({ iconUrl: apartmentIconPng, iconSize: [35, 35] }),
  Office: new Icon({ iconUrl: officeIconPng, iconSize: [35, 35] }),
};

const Listings = () => {
  const [view, setView] = useState('standard');
  const [map, setMap] = useState(null);

  const baseLayers = {
    standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.png",
  };

  function MapInstance() {
    const instance = useMap();
    useEffect(() => {
      setMap(instance);
    }, [instance]);
    return null;
  }

  const handleFlyTo = (coordinates) => {
    if (map) {
      map.flyTo(coordinates, 15);
    }
  };

  return (
    <Grid container spacing={0}>
      {/* Left: Listings */}
      <Grid item xs={4} sx={{ height: '100vh', overflowY: 'auto', p: 2, backgroundColor: '#f9f9f9' }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Browse Listings
        </Typography>

        <div style={{ marginBottom: '1rem' }}>
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
        </div>

        {myListings.map((listing) => (
          <Card key={listing.id} sx={{ mb: 2, position: 'relative' }}>
            <CardMedia
              component="img"
              height="160"
              image={listing.picture1}
              alt={listing.title}
              onClick={() => handleFlyTo(listing.location.coordinates)}
              sx={{ cursor: 'pointer' }}
            />
            <CardContent>
              <Typography variant="h6">{listing.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {listing.description.substring(0, 100)}...
              </Typography>
              <Typography variant="subtitle1" color="green" fontWeight="bold" mt={1}>
                {listing.property_status === 'Rent'
                  ? `$${listing.price} / ${listing.rental_frequency}`
                  : `$${listing.price.toLocaleString()}`}
              </Typography>
            </CardContent>
            <IconButton
              sx={{ position: 'absolute', top: 10, right: 10, background: '#fff' }}
              onClick={() => handleFlyTo(listing.location.coordinates)}
            >
              <RoomIcon color="primary" />
            </IconButton>
          </Card>
        ))}
      </Grid>

      {/* Right: Map */}
      <Grid item xs={8}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: '100vh', width: '100%' }}
        >
          <MapInstance />
          <TileLayer attribution='&copy; OpenStreetMap contributors' url={baseLayers[view]} />
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
                  style={{ width: '100%', borderRadius: '8px', margin: '0.5rem 0' }}
                />
                <Typography variant="body2">{listing.description.substring(0, 100)}...</Typography>
                <Button size="small" variant="contained" fullWidth sx={{ mt: 1 }}>
                  View Details
                </Button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Grid>
    </Grid>
  );
};

export default Listings;
