// src/pages/Listings/index.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Map as LeafletMap } from "leaflet";
import { Box, Alert, CircularProgress, Grid, useMediaQuery, useTheme } from "@mui/material";

import FilterBar from "../../Components/FilterBar";
import ListingsList from "../../pages/Listings/ListingsList.js";   // <-- make sure path matches your file
import MapView from "../../pages/Listings/MapView.js";             // <-- make sure path matches your file

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export type Poi = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
};

export type Listing = {
  id: number;
  title: string;
  description: string;
  listing_type: string;
  property_status: string;
  rental_frequency?: string | null;
  price: string | number;
  latitude: number | null;
  longitude: number | null;
  image_main?: string | null;
  image_main_url?: string | null;
  seller_username?: string | null;
  seller_agency_name?: string | null;
  listing_pois_within_10km?: Poi[];
};

type ViewMode = "standard" | "satellite";

const ListingsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setView] = useState<ViewMode>((searchParams.get("view") as ViewMode) || "standard");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const mapRef = useRef<LeafletMap | null>(null);

  // Build query for API from URL
  const apiQuery = useMemo(() => {
    const q: Record<string, string> = {};
    const push = (k: string, v: string | null) => {
      if (v && v.trim() !== "") q[k] = v;
    };
    push("q", searchParams.get("q"));
    push("type", searchParams.get("type"));
    push("status", searchParams.get("status"));
    push("min_price", searchParams.get("min_price"));
    push("max_price", searchParams.get("max_price"));
    push("bedrooms", searchParams.get("bedrooms"));
    push("bathrooms", searchParams.get("bathrooms"));
    push("furnished", searchParams.get("furnished"));
    push("parking", searchParams.get("parking"));
    push("pool", searchParams.get("pool"));
    push("page", searchParams.get("page") || "1");
    push("ordering", searchParams.get("ordering") || "-date_posted");
    return q;
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const qs = new URLSearchParams(apiQuery).toString();
        const res = await fetch(`${API_BASE}/api/listings/?${qs}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();

        // --- normalize ---
        const items =
          Array.isArray(payload) ? payload
          : Array.isArray(payload?.results) ? payload.results
          : Array.isArray(payload?.data) ? payload.data
          : Array.isArray(payload?.items) ? payload.items
          : null;

        if (!Array.isArray(items)) {
          throw new Error("Unexpected response shape from /api/listings/");
        }

        if (!cancelled) setListings(items as Listing[]);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load listings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [apiQuery]);

  const flyTo = useCallback((lat?: number | null, lon?: number | null) => {
    if (mapRef.current && lat != null && lon != null) {
      mapRef.current.flyTo([lat, lon], 15);
    }
  }, []);

  const goToDetails = useCallback((id: number) => navigate(`/listings/${id}`), [navigate]);

  const applyFilters = (patch: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || v === false) next.delete(k);
      else next.set(k, String(v));
    });
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  };

  const firstWithCoords = listings.find((l) => l.latitude != null && l.longitude != null);
  const initialCenter: [number, number] = firstWithCoords
    ? [firstWithCoords.latitude as number, firstWithCoords.longitude as number]
    : [1.3733, 32.2903];

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", height: "70vh" }}>
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
    <Box sx={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Filters */}
      <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <FilterBar
          values={{
            q: searchParams.get("q") || "",
            type: searchParams.get("type") || "",
            status: searchParams.get("status") || "",
            min_price: searchParams.get("min_price") || "",
            max_price: searchParams.get("max_price") || "",
            bedrooms: searchParams.get("bedrooms") || "",
            bathrooms: searchParams.get("bathrooms") || "",
            furnished: searchParams.get("furnished") === "true",
            parking: searchParams.get("parking") === "true",
            pool: searchParams.get("pool") === "true",
            ordering: searchParams.get("ordering") || "-date_posted",
          }}
          onChange={applyFilters}
          view={view}
          onToggleView={(v) => {
            setView(v);
            const next = new URLSearchParams(searchParams);
            next.set("view", v);
            setSearchParams(next, { replace: true });
          }}
          onReset={() => setSearchParams({}, { replace: true })}
        />
      </Box>

      {/* Layout (MUI Grid v2) */}
      <Grid
        container
        wrap="nowrap"
        sx={{
          height: `calc(100vh - 72px)`,
          [theme.breakpoints.down("md")]: {
            height: `calc(100vh - 120px)`,
            flexDirection: "column",
          },
        }}
      >
        {/* Sidebar */}
        <Grid
          sx={{
            height: "100%",
            overflowY: "auto",
            borderRight: { md: `1px solid ${theme.palette.divider}` },
            order: { xs: 2, md: 1 },
          }}
          size={{ xs: 12, md: 5 }}   // <-- Grid v2: use `size`
        >
          <ListingsList
            listings={listings}
            apiBase={API_BASE}
            onFlyTo={flyTo}
            onOpen={goToDetails}
            view={view}
            setView={setView}
          />
        </Grid>

        {/* Map */}
        <Grid sx={{ height: "100%", order: { xs: 1, md: 2 } }} size={{ xs: 12, md: 7 }}>
          <MapView
            listings={listings}
            apiBase={API_BASE}         // <-- pass apiBase
            view={view}
            initialCenter={initialCenter}
            mapRef={mapRef}           // <-- pass mapRef
            onOpen={goToDetails}      // <-- prop is `onOpen` in MapView
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ListingsPage;
