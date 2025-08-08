// src/pages/PaymentPage.jsx
import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentsApi } from "../api/paymentsApi";
import useScript from "../hooks/useScript";
import {
  Box, Paper, Typography, TextField, RadioGroup, FormControlLabel, Radio,
  Stack, Button, Alert, Divider
} from "@mui/material";

// PUBLIC keys go in frontend env
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// External SDKs (loaded on demand)
const FLW_SRC = "https://checkout.flutterwave.com/v3.js";
const STRIPE_SRC = "https://js.stripe.com/v3/";
// Build PayPal SDK URL with your clientId
const PAYPAL_SRC = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD&intent=capture&enable-funding=venmo`;

export default function PaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // You can pass listingId & amount via URL, e.g. /pay?listingId=12&amount=1500
  const listingId = params.get("listingId");
  const defaultAmount = Number(params.get("amount") || 1000);

  const [method, setMethod] = useState("paypal"); // paypal | flutterwave | stripe
  const [amount, setAmount] = useState(defaultAmount);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Load scripts only when needed
  const paypalStatus = useScript(method === "paypal" ? PAYPAL_SRC : null);
  const stripeStatus = useScript(method === "stripe" ? STRIPE_SRC : null);
  const flutterwaveStatus = useScript(method === "flutterwave" ? FLW_SRC : null);

  const isValid = useMemo(() => {
    if (!name.trim() || !email.trim()) return false;
    if (!amount || Number(amount) <= 0) return false;
    return true;
  }, [name, email, amount]);

  const meta = useMemo(
    () => ({ listingId: listingId ? Number(listingId) : null }),
    [listingId]
  );

  // ---------- PayPal ----------
  const payWithPayPal = async () => {
    try {
      setErr("");
      if (!isValid) return setErr("Please fill name, email and amount.");
      if (paypalStatus !== "ready") return setErr("PayPal SDK still loading…");

      setBusy(true);
      // 1) Ask backend to create the order
      const order = await paymentsApi.createPayPalOrder(amount, "USD", { ...meta, name, email });

      // 2) Use the approval link OR render buttons; simpler: redirect to approval
      const approve = order?.links?.find(l => l.rel === "approve")?.href;
      if (approve) {
        window.location.href = approve; // PayPal hosted page, will return to your success/cancel URLs
      } else {
        setErr("Could not get PayPal approval link.");
      }
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  // ---------- Flutterwave ----------
  const payWithFlutterwave = async () => {
    try {
      setErr("");
      if (!isValid) return setErr("Please fill name, email and amount.");
      if (flutterwaveStatus !== "ready") return setErr("Flutterwave SDK still loading…");
      if (!window.FlutterwaveCheckout) return setErr("Flutterwave SDK not found.");

      setBusy(true);
      // You can either let backend return a hosted pay link OR use inline modal.
      // Here we do INLINE (like your e-com code).
      window.FlutterwaveCheckout({
        public_key: import.meta.env.VITE_FLW_PUBLIC_KEY, // PUBLIC
        tx_ref: `TX_${Date.now()}`,
        amount: Number(amount) * 3500, // UGX approx (adjust as needed or let backend compute)
        currency: "UGX",
        payment_options: "card, mobilemoneyuganda",
        customer: { email, name },
        meta,
        customizations: {
          title: "Plot Reservation",
          description: `Payment for listing ${listingId || ""}`,
          logo: "/favicon.ico",
        },
        callback: function (response) {
          // Let the backend verify (optional). For now, go to success page with tx details.
          navigate(`/payment-success?gateway=flutterwave&tx_ref=${response.tx_ref}`);
        },
        onclose: function () {
          // modal closed
        },
      });
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  // ---------- Stripe ----------
  const payWithStripe = async () => {
    try {
      setErr("");
      if (!isValid) return setErr("Please fill name, email and amount.");
      if (stripeStatus !== "ready") return setErr("Stripe SDK still loading…");
      if (!window.Stripe) return setErr("Stripe SDK not found.");

      setBusy(true);
      const { id } = await paymentsApi.createStripeSession(amount, "usd", "Plot Reservation", { ...meta, name, email });
      if (!id) return setErr("Could not create Stripe session.");

      const stripe = window.Stripe(STRIPE_PK);
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: 4, px: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Complete Payment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {listingId ? <>For Listing <b>#{listingId}</b></> : "No listing id provided"}
        </Typography>

        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
          />
          <TextField
            label="Amount (USD)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            inputProps={{ min: 1 }}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
          Choose Payment Method
        </Typography>

        <RadioGroup
          row
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          sx={{ mb: 2 }}
        >
          <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
          <FormControlLabel value="flutterwave" control={<Radio />} label="Flutterwave (UGX)" />
          <FormControlLabel value="stripe" control={<Radio />} label="Stripe" />
        </RadioGroup>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          {method === "paypal" && (
            <Button
              disabled={!isValid || busy || paypalStatus !== "ready"}
              variant="contained"
              onClick={payWithPayPal}
            >
              Pay with PayPal
            </Button>
          )}

          {method === "flutterwave" && (
            <Button
              disabled={!isValid || busy || flutterwaveStatus !== "ready"}
              variant="contained"
              color="secondary"
              onClick={payWithFlutterwave}
            >
              Pay with Flutterwave
            </Button>
          )}

          {method === "stripe" && (
            <Button
              disabled={!isValid || busy || stripeStatus !== "ready"}
              variant="contained"
              color="success"
              onClick={payWithStripe}
            >
              Pay with Stripe
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
