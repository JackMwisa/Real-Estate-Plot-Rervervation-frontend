import React from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function usePaymentMeta() {
  const { state } = useLocation();
  const [params] = useSearchParams();

  // Prefer navigation state, fall back to query params
  const gateway = state?.gateway || params.get("gateway") || "Payment";
  const amount = Number(state?.amount ?? params.get("amount") ?? 0);
  const currency =
    (state?.currency || params.get("currency") || "USD").toUpperCase();
  const listingId = state?.listingId || params.get("listingId") || null;
  const title = state?.title || params.get("title") || "";
  const orderId =
    state?.orderId ||
    state?.transactionId ||
    params.get("orderId") ||
    params.get("transaction_id") ||
    params.get("tx_ref") ||
    "";

  return { gateway, amount, currency, listingId, title, orderId };
}

const fmtMoney = (n, currency = "USD") =>
  Number.isFinite(n)
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(n)
    : "";

export default function PaymentSuccess() {
  const { gateway, amount, currency, listingId, title, orderId } =
    usePaymentMeta();

  const handleCopy = async () => {
    try {
      if (orderId) {
        await navigator.clipboard.writeText(orderId);
      }
    } catch {
      /* noop */
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: 6, px: 2 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          textAlign: "center",
          borderRadius: 3,
          background:
            "linear-gradient(180deg, rgba(240,255,244,0.9) 0%, #fff 60%)",
        }}
      >
        <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />
          <Typography variant="h4" fontWeight={800}>
            Payment Successful
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thanks! Your payment via <b>{gateway}</b> was completed.
          </Typography>
        </Stack>

        {(title || amount) && (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ mb: 2 }}
          >
            {title ? <Chip icon={<HomeWorkIcon />} label={title} /> : null}
            {Number(amount) > 0 ? (
              <Chip color="success" label={fmtMoney(amount, currency)} />
            ) : null}
            <Chip label={currency} variant="outlined" />
          </Stack>
        )}

        {orderId ? (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Chip
              icon={<ReceiptLongIcon />}
              variant="outlined"
              label={
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  Ref:&nbsp;<b>{orderId}</b>
                </span>
              }
            />
            <Tooltip title="Copy reference">
              <IconButton onClick={handleCopy} size="small">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Your receipt has been created. You can view the booking from your
            dashboard.
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="center"
        >
          <Button
            component={Link}
            to="/listings"
            variant="outlined"
            size="large"
          >
            Back to Listings
          </Button>

          {listingId ? (
            <Button
              component={Link}
              to={`/listings/${listingId}`}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
            >
              View Property
            </Button>
          ) : (
            <Button component={Link} to="/" variant="contained" size="large">
              Go Home
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
