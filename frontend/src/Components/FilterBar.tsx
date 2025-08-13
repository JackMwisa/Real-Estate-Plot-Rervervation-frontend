import React, { useEffect, useMemo, useState } from "react";
import {
  Box, TextField, MenuItem, Slider, FormControlLabel, Checkbox,
  Button, Stack, InputAdornment, Select, Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type Props = {
  value: URLSearchParams;
  onChange: (next: URLSearchParams) => void;
  loading?: boolean;
};

const types = ["", "apartment", "house", "condo", "townhouse", "land"];
const statuses = ["", "available", "sold", "pending", "rented"];

export default function FilterBar({ value, onChange, loading }: Props) {
  // Local state mirrors query params for debounced updates
  const [q, setQ] = useState(value.get("search") || "");
  const [minPrice, setMinPrice] = useState<number>(Number(value.get("min_price") || 0));
  const [maxPrice, setMaxPrice] = useState<number>(Number(value.get("max_price") || 1000000));
  const [bedrooms, setBedrooms] = useState<number | "">(
    (value.get("bedrooms") && Number(value.get("bedrooms"))) || ""
  );
  const [bathrooms, setBathrooms] = useState<number | "">(
    (value.get("bathrooms") && Number(value.get("bathrooms"))) || ""
  );
  const [listingType, setListingType] = useState(value.get("listing_type") || "");
  const [status, setStatus] = useState(value.get("property_status") || "");
  const [furnished, setFurnished] = useState<boolean>(value.get("furnished") === "true");
  const [ordering, setOrdering] = useState(value.get("ordering") || "-date_posted");

  // Debounce text search
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(value.toString());
      if (q) next.set("search", q); else next.delete("search");
      next.set("page", "1");
      onChange(next);
    }, 350);
    return () => clearTimeout(id);
  }, [q]); // eslint-disable-line

  // Slider marks (optional)
  const marks = useMemo(
    () => [
      { value: 0, label: "$0" },
      { value: 250000, label: "$250k" },
      { value: 500000, label: "$500k" },
      { value: 1000000, label: "$1M" },
    ],
    []
  );

  const applyNow = () => {
    const next = new URLSearchParams(value.toString());
    // numeric filters
    if (minPrice > 0) next.set("min_price", String(minPrice)); else next.delete("min_price");
    if (maxPrice && maxPrice !== 1000000) next.set("max_price", String(maxPrice)); else next.delete("max_price");
    if (bedrooms !== "") next.set("bedrooms", String(bedrooms)); else next.delete("bedrooms");
    if (bathrooms !== "") next.set("bathrooms", String(bathrooms)); else next.delete("bathrooms");

    // enums/boolean
    if (listingType) next.set("listing_type", listingType); else next.delete("listing_type");
    if (status) next.set("property_status", status); else next.delete("property_status");
    if (furnished) next.set("furnished", "true"); else next.delete("furnished");

    // ordering & page reset
    if (ordering) next.set("ordering", ordering); else next.delete("ordering");
    next.set("page", "1");

    onChange(next);
  };

  const clearAll = () => {
    onChange(new URLSearchParams({ ordering: "-date_posted", page: "1" }));
    setQ(""); setMinPrice(0); setMaxPrice(1000000);
    setBedrooms(""); setBathrooms(""); setListingType(""); setStatus("");
    setFurnished(false); setOrdering("-date_posted");
  };

  return (
    <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, mb: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          fullWidth
          placeholder="Search title, description, area…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />

        <TextField
          label="Bedrooms"
          type="number"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value === "" ? "" : Number(e.target.value))}
          sx={{ width: { xs: "100%", sm: 140 } }}
        />
        <TextField
          label="Bathrooms"
          type="number"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value === "" ? "" : Number(e.target.value))}
          sx={{ width: { xs: "100%", sm: 140 } }}
        />

        <TextField select label="Type" value={listingType} onChange={(e) => setListingType(e.target.value)} sx={{ minWidth: 160 }}>
          {types.map((t) => <MenuItem key={t} value={t}>{t || "Any type"}</MenuItem>)}
        </TextField>

        <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
          {statuses.map((t) => <MenuItem key={t} value={t}>{t || "Any status"}</MenuItem>)}
        </TextField>

        <FormControlLabel
          control={<Checkbox checked={furnished} onChange={(e) => setFurnished(e.target.checked)} />}
          label="Furnished"
        />
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ display: "block", mb: 1 }}>Price range</Typography>
        <Slider
          value={[minPrice, maxPrice]}
          min={0}
          max={1000000}
          step={5000}
          marks={marks}
          onChange={(_, val) => {
            const [min, max] = val as number[];
            setMinPrice(min); setMaxPrice(max);
          }}
        />
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mt: 1 }}>
        <Select size="small" value={ordering} onChange={(e) => setOrdering(String(e.target.value))}>
          <MenuItem value="-date_posted">Newest</MenuItem>
          <MenuItem value="price">Price: Low → High</MenuItem>
          <MenuItem value="-price">Price: High → Low</MenuItem>
          <MenuItem value="updated_at">Recently updated</MenuItem>
        </Select>

        <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
          <Button variant="outlined" onClick={clearAll} disabled={loading}>Clear</Button>
          <Button variant="contained" onClick={applyNow} disabled={loading}>Apply</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
