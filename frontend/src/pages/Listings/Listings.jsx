import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';

// Icons
import houseIconPng from '../../assets/Mapicons/house.png';
import apartmentIconPng from '../../assets/Mapicons/apartment.png';
import officeIconPng from '../../assets/Mapicons/office.png';

// Data
import myListings from '../../assets/Data/Dummydata';

// Styled Components
import {
  ListingsContainer,
  ListingsSidebar,
  ListingsMap,
  ListingCard,
  ListingMedia,
  ListingContent,
  FlyToIcon,
} from './ListingsStyles';

const iconMap = {
  House: new Icon({ iconUrl: houseIconPng, iconSize: [35, 35] }),
  Apartment: new Icon({ iconUrl: apartmentIconPng, iconSize: [35, 35] }),
  Office: new Icon({ iconUrl: officeIconPng, iconSize: [35, 35] }),
};

const Listings = () => {
  const [view, setView] = useState('standard');
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const baseLayers = {
    standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.png",
  };

  const MapInstance = () => {
    const instance = useMap();
    useEffect(() => {
      setMap(instance);
      setMapLoaded(true);
      setTimeout(() => {
        instance.invalidateSize();
      }, 100);
    }, [instance]);
    return null;
  };

  const handleFlyTo = (coordinates) => {
    if (map) {
      map.flyTo(coordinates, 15);
    }
  };

  // Calculate initial center based on listings if available
  const initialCenter = myListings.length > 0 
    ? myListings[0].location.coordinates 
    : [51.505, -0.09];

  // Fix for map not displaying properly on resize
  useEffect(() => {
    const handleResize = () => {
      if (map) {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  return (
    <ListingsContainer container>
      {/* LEFT: Listings Sidebar */}
      <ListingsSidebar item xs={12} md={4}>
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
          <ListingCard key={listing.id}>
            <ListingMedia
              component="img"
              image={listing.picture1}
              alt={listing.title}
              onClick={() => handleFlyTo(listing.location.coordinates)}
            />
            <ListingContent>
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
            </ListingContent>
            <FlyToIcon
              onClick={() => handleFlyTo(listing.location.coordinates)}
            >
              <RoomIcon color="primary" />
            </FlyToIcon>
          </ListingCard>
        ))}
      </ListingsSidebar>

      {/* RIGHT: Map */}
      <ListingsMap item xs={12} md={8}>
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
          <MapContainer
            center={initialCenter}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', minHeight: '400px' }}
            whenCreated={(mapInstance) => {
              setMap(mapInstance);
              setMapLoaded(true);
              setTimeout(() => mapInstance.invalidateSize(), 100);
            }}
          >
            <MapInstance />
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
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
        </div>
      </ListingsMap>
    </ListingsContainer>
  );
};

export default Listings;