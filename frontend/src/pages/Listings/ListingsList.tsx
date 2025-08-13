import React from "react";
import { Box, Button, Typography } from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import type { Listing } from ".";
import { ListingCard, ListingContent, ListingMedia, FlyToIcon } from "./ListingsStyles.js";

type Props = {
  listings: Listing[];
  apiBase: string;
  onFlyTo: (lat?: number | null, lon?: number | null) => void;
  onOpen: (id: number) => void;
  view: "standard" | "satellite";
  setView: (v: "standard" | "satellite") => void;
};

const toPrice = (p: string | number) => {
  const n = typeof p === "number" ? p : Number(p);
  return Number.isFinite(n) ? n.toLocaleString() : p;
};

const imageUrl = (apiBase: string, l: Listing) => {
  if (l.image_main_url) return l.image_main_url;
  if (l.image_main) return `${apiBase}${l.image_main}`;
  return "https://via.placeholder.com/640x360?text=Listing";
};

export default function ListingsList({ listings, apiBase, onFlyTo, onOpen, view, setView }: Props) {
  return (
    <>
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

      <Box sx={{ overflowY: "auto", height: "calc(100% - 180px)" }}>
        {listings.map((listing) => {
          const isRent = (listing.rental_frequency ?? "").length > 0;
          const priceText = isRent
            ? `$${toPrice(listing.price)} / ${listing.rental_frequency}`
            : `$${toPrice(listing.price)}`;

          return (
            <ListingCard key={listing.id}>
              <ListingMedia
                component="img"
                image={imageUrl(apiBase, listing)}
                alt={listing.title}
                onClick={() => onOpen(listing.id)}
              />
              <ListingContent>
                <Typography variant="h6" sx={{ cursor: "pointer" }} onClick={() => onOpen(listing.id)}>
                  {listing.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(listing.description || "").slice(0, 100)}...
                </Typography>
                <Typography variant="subtitle1" color="green" fontWeight="bold" mt={1}>
                  {priceText}
                </Typography>
              </ListingContent>
              <FlyToIcon onClick={() => onFlyTo(listing.latitude, listing.longitude)}>
                <RoomIcon color="primary" />
              </FlyToIcon>
            </ListingCard>
          );
        })}
      </Box>
    </>
  );
}
