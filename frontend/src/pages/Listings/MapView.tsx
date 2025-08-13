import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Typography, Button } from "@mui/material";
import type { Listing } from ".";

import houseIconPng from "../../assets/Mapicons/house.png";
import apartmentIconPng from "../../assets/Mapicons/apartment.png";
import officeIconPng from "../../assets/Mapicons/office.png";

const iconHouse = new Icon({ iconUrl: houseIconPng, iconSize: [35, 35] });
const iconApt = new Icon({ iconUrl: apartmentIconPng, iconSize: [35, 35] });
const iconOffice = new Icon({ iconUrl: officeIconPng, iconSize: [35, 35] });

const pickIcon = (listingType?: string) => {
  const t = (listingType || "").toLowerCase();
  if (t === "apartment") return iconApt;
  if (t === "office" || t === "condo" || t === "townhouse") return iconOffice;
  return iconHouse;
};

type Props = {
  listings: Listing[];
  apiBase: string;
  view: "standard" | "satellite";
  initialCenter: [number, number];
  mapRef: React.MutableRefObject<LeafletMap | null>;
  onOpen: (id: number) => void;
};

const baseLayers = {
  standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.png",
} as const;

const imageUrl = (apiBase: string, l: Listing) => {
  if (l.image_main_url) return l.image_main_url;
  if (l.image_main) return `${apiBase}${l.image_main}`;
  return "https://via.placeholder.com/640x360?text=Listing";
};

function MapController({ mapRef }: { mapRef: React.MutableRefObject<LeafletMap | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

export default function MapView({ listings, apiBase, view, initialCenter, mapRef, onOpen }: Props) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={initialCenter}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        whenCreated={(map) => {
          mapRef.current = map;
          setTimeout(() => map.invalidateSize(), 100);
        }}
      >
        <MapController mapRef={mapRef} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={baseLayers[view]}
        />

        {listings
          .filter((l) => l.latitude != null && l.longitude != null)
          .map((l) => (
            <Marker key={l.id} position={[l.latitude as number, l.longitude as number]} icon={pickIcon(l.listing_type)}>
              <Popup>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {l.title}
                </Typography>
                <img
                  src={imageUrl(apiBase, l)}
                  alt={l.title}
                  style={{ width: "100%", borderRadius: 8, margin: "0.5rem 0" }}
                />
                <Typography variant="body2">{(l.description || "").slice(0, 100)}...</Typography>
                <Button size="small" variant="contained" fullWidth sx={{ mt: 1 }} onClick={() => onOpen(l.id)}>
                  View Details
                </Button>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
