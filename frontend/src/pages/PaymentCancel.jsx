import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  Chip,
} from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export default function PaymentCancel() {
  const { state } = useLocation();
  const listingId = state?.listingId || null;
  const title = state?.title || "";

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: 6, px: 2 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          textAlign: "center",
          borderRadius: 3,
          background: "linear-gradient(180deg, #fff7f7 0%, #fff 60%)",
        }}
      >
        <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CancelOutlinedIcon color="error" sx={{ fontSize: 48 }} />
          <Typography variant="h4" fontWeight={800}>
            Payment Cancelled
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No worries — you can try again any time.
          </Typography>
        </Stack>

        {title ? (
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
            <Chip label={title} />
          </Stack>
        ) : null}

        <Alert severity="info" sx={{ textAlign: "left", mb: 3 }}>
          If you cancelled by mistake, you can resume checkout. If this keeps
          happening, please contact support or try a different payment method.
        </Alert>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="center"
        >
          {listingId ? (
            <Button
              component={Link}
              to={`/listings/${listingId}`}
              variant="outlined"
              size="large"
              startIcon={<HelpOutlineIcon />}
            >
              Back to Property
            </Button>
          ) : (
            <Button component={Link} to="/listings" variant="outlined" size="large">
              Back to Listings
            </Button>
          )}

          <Button
            component={Link}
            to="/pay"
            state={state || {}}
            variant="contained"
            size="large"
            startIcon={<ReplayIcon />}
          >
            Try Again
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
