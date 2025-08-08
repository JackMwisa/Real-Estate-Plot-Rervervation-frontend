// src/pages/Listings.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import type { Map } from "leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

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
  Alert,
} from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";

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

type Poi = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
};

type Listing = {
  id: number;
  title: string;
  description: string;
  listing_type: string;
  property_status: string;
  rental_frequency?: string | null;
  price: string | number;
  latitude: number | null;
  longitude: number | null;

  // Use whatever you return from DRF:
  // image_main: relative path like "/media/..."
  image_main?: string | null;
  // or absolute URL via SerializerMethodField:
  image_main_url?: string | null;

  seller_username?: string | null;
  seller_agency_name?: string | null;
  listing_pois_within_10km?: Poi[];
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

const Listings: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [view, setView] = useState<"standard" | "satellite">("standard");
  const mapRef = useRef<Map | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  const baseLayers = {
    standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite:
      "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.png",
  } as const;

  const firstWithCoords = listings.find(
    (l) => l.latitude != null && l.longitude != null
  );
  const initialCenter: [number, number] = firstWithCoords
    ? [firstWithCoords.latitude as number, firstWithCoords.longitude as number]
    : [51.505, -0.09];

  const MapController = () => {
    const map = useMap();
    useEffect(() => {
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
      return () => {
        mapRef.current = null;
      };
    }, [map]);
    return null;
  };

  const handleFlyTo = (lat?: number | null, lon?: number | null) => {
    if (mapRef.current && lat != null && lon != null) {
      mapRef.current.flyTo([lat, lon], 15);
    }
  };

  // Resize fix
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) setTimeout(() => mapRef.current!.invalidateSize(), 100);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch listings
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_BASE}/api/listings/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Listing[] = await res.json();
        if (!cancelled) setListings(data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load listings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toPrice = (p: string | number) => {
    const n = typeof p === "number" ? p : Number(p);
    return Number.isFinite(n) ? n.toLocaleString() : p;
  };

  const imageUrl = (l: Listing) => {
    // Prefer absolute URL from API; fallback to relative + API_BASE
    if (l.image_main_url) return l.image_main_url;
    if (l.image_main) return `${API_BASE}${l.image_main}`;
    return "https://via.placeholder.com/640x360?text=Listing";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (err) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Could not load listings: {err}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column-reverse" : "row",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: isMobile ? "100%" : "40%",
          height: isMobile ? "40%" : "100%",
          overflowY: "auto",
          p: 2,
          bgcolor: theme.palette.grey[100],
          borderRight: isMobile ? "none" : `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Browse Listings
        </Typography>

        <Box sx={{ mb: "1rem" }}>
          <Button
            onClick={() => setView("standard")}
            variant={view === "standard" ? "contained" : "outlined"}
            sx={{ mr: 1 }}
          >
            Standard View
          </Button>
          <Button
            onClick={() => setView("satellite")}
            variant={view === "satellite" ? "contained" : "outlined"}
          >
            Satellite View
          </Button>
        </Box>

        <Box sx={{ overflowY: "auto", height: "calc(100% - 100px)" }}>
          {listings.map((listing) => {
            const isRent = (listing.rental_frequency ?? "").length > 0;
            const priceText = isRent
              ? `$${toPrice(listing.price)} / ${listing.rental_frequency}`
              : `$${toPrice(listing.price)}`;

            return (
              <Card
                key={listing.id}
                sx={{
                  mb: 2,
                  position: "relative",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.01)", boxShadow: theme.shadows[4] },
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={imageUrl(listing)}
                  alt={listing.title}
                  onClick={() => handleFlyTo(listing.latitude, listing.longitude)}
                  sx={{ cursor: "pointer", objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h6">{listing.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(listing.description || "").slice(0, 100)}...
                  </Typography>
                  <Typography variant="subtitle1" color="green" fontWeight="bold" mt={1}>
                    {priceText}
                  </Typography>
                </CardContent>
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "#fff",
                    zIndex: 1,
                    "&:hover": { background: theme.palette.grey[200] },
                  }}
                  onClick={() => handleFlyTo(listing.latitude, listing.longitude)}
                >
                  <RoomIcon color="primary" />
                </IconButton>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* Map */}
      <Box sx={{ width: isMobile ? "100%" : "60%", height: isMobile ? "60%" : "100%", position: "relative" }}>
        <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
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
            <MapController />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={baseLayers[view]}
            />

            {listings
              .filter((l) => l.latitude != null && l.longitude != null)
              .map((listing) => (
                <Marker
                  key={listing.id}
                  position={[listing.latitude as number, listing.longitude as number]}
                  icon={pickIcon(listing.listing_type)}
                >
                  <Popup>
                    <Typography variant="h6">{listing.title}</Typography>
                    <img
                      src={imageUrl(listing)}
                      alt={listing.title}
                      style={{ width: "100%", borderRadius: 8, margin: "0.5rem 0" }}
                    />
                    <Typography variant="body2">
                      {(listing.description || "").slice(0, 100)}...
                    </Typography>
                    <Button size="small" variant="contained" fullWidth sx={{ mt: 1 }}>
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
