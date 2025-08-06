import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Icons
import houseIconPng from '../assets/Mapicons/house.png';
import apartmentIconPng from '../assets/Mapicons/apartment.png';
import officeIconPng from '../assets/Mapicons/office.png';

// Data
import myListings from '../assets/Data/Dummydata';

const Listings = () => {
  const [view, setView] = useState('standard');

  const baseLayers = {
    standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.png",
  };

  const iconMap = {
    House: new Icon({ iconUrl: houseIconPng, iconSize: [35, 35] }),
    Apartment: new Icon({ iconUrl: apartmentIconPng, iconSize: [35, 35] }),
    Office: new Icon({ iconUrl: officeIconPng, iconSize: [35, 35] }),
  };

  const defaultCenter = [51.505, -0.09];

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-4">Browse Property Listings</h1>
      <p className="text-lg mb-2">
        Find the latest properties listed by trusted agencies and individual sellers.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Use filters to narrow down results by price, location, and type.
      </p>

      {/* Toggle Buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setView('standard')}
          className={`px-4 py-2 rounded border text-sm font-medium ${
            view === 'standard'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
          }`}
        >
          Standard View
        </button>
        <button
          onClick={() => setView('satellite')}
          className={`px-4 py-2 rounded border text-sm font-medium ${
            view === 'satellite'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
          }`}
        >
          Satellite View
        </button>
      </div>

      {/* MAP */}
      <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={defaultCenter}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={baseLayers[view]}
          />

          {myListings.map((listing) => (
            <Marker
              key={listing.id}
              position={[
                listing.location.coordinates[0],
                listing.location.coordinates[1]
              ]}
              icon={iconMap[listing.listing_type] || iconMap.House}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{listing.title}</strong>
                  <img
                    src={listing.picture1}
                    alt={listing.title}
                    style={{ width: '100%', borderRadius: '0.5rem', margin: '0.5rem 0' }}
                  />
                  <p>{listing.description.substring(0, 100)}...</p>
                  <p className="font-semibold mt-1">
                    {listing.property_status === 'Rent'
                      ? `Rent: $${listing.price} / ${listing.rental_frequency}`
                      : `Price: $${listing.price.toLocaleString()}`}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Listings;
