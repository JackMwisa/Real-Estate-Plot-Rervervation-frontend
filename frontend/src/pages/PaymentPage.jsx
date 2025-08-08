// src/pages/PaymentPage.jsx
import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  createPayPalOrder,
  createStripeCheckout,
  // initFlutterwavePayment, // optional if you want server-init; we use inline here
} from "../api/paymentsApi";
import useScript from "../hooks/useScript";
import {
  Box, Paper, Typography, TextField, RadioGroup, FormControlLabel, Radio,
  Stack, Button, Alert, Divider
} from "@mui/material";

// PUBLIC keys go in frontend env
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const FLW_PUBLIC_KEY = import.meta.env.VITE_FLW_PUBLIC_KEY;

// External SDKs (loaded on demand)
const FLW_SRC = "https://checkout.flutterwave.com/v3.js";
const STRIPE_SRC = "https://js.stripe.com/v3/";
const PAYPAL_SRC = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture&enable-funding=venmo`;

export default function PaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

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
    () => ({ listingId: listingId ? Number(listingId) : null, name, email }),
    [listingId, name, email]
  );

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  // ---------- PayPal ----------
  const payWithPayPal = async () => {
    try {
      setErr("");
      if (!isValid) return setErr("Please fill name, email and amount.");
      if (paypalStatus !== "ready") return setErr("PayPal SDK still loading…");

      setBusy(true);
      // Ask backend to create the order and set your redirect URLs
      const order = await createPayPalOrder(amount, "USD", {
        successUrl: `${origin}/payment-success?gateway=paypal`,
        cancelUrl: `${origin}/payment-cancel`,
      });

      // If backend returns approval link:
      const approve = order?.links?.find((l) => l.rel === "approve")?.href;
      if (approve) {
        window.location.href = approve; // go to PayPal hosted page
      } else {
        setErr("Could not get PayPal approval link.");
      }
    } catch (e) {
      setErr(e?.message || "PayPal create order failed.");
    } finally {
      setBusy(false);
    }
  };

  // ---------- Flutterwave (inline) ----------
  const payWithFlutterwave = async () => {
    try {
      setErr("");
      if (!isValid) return setErr("Please fill name, email and amount.");
      if (flutterwaveStatus !== "ready") return setErr("Flutterwave SDK still loading…");
      if (!window.FlutterwaveCheckout) return setErr("Flutterwave SDK not found.");
      if (!FLW_PUBLIC_KEY) return setErr("Flutterwave public key missing (VITE_FLW_PUBLIC_KEY).");

      setBusy(true);
      window.FlutterwaveCheckout({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: `TX_${Date.now()}`,
        amount: Number(amount) * 3500, // convert if you want UGX inline; or use USD if you prefer
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
          // Optionally verify on backend first, then:
          navigate(`/payment-success?gateway=flutterwave&tx_ref=${response.tx_ref}`);
        },
        onclose: function () {},
      });
    } catch (e) {
      setErr(e?.message || "Flutterwave init failed.");
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
      if (!STRIPE_PK) return setErr("Stripe publishable key missing (VITE_STRIPE_PUBLISHABLE_KEY).");

      setBusy(true);
      const { id } = await createStripeCheckout({
        amount,
        currency: "usd",
        productName: listingId ? `Plot Reservation #${listingId}` : "Plot Reservation",
        successUrl: `${origin}/payment-success?gateway=stripe`,
        cancelUrl: `${origin}/payment-cancel`,
      });
      if (!id) return setErr("Could not create Stripe session.");

      const stripe = window.Stripe(STRIPE_PK);
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (e) {
      setErr(e?.message || "Stripe create session failed.");
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
          <TextField label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
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

        <RadioGroup row value={method} onChange={(e) => setMethod(e.target.value)} sx={{ mb: 2 }}>
          <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
          <FormControlLabel value="flutterwave" control={<Radio />} label="Flutterwave (UGX)" />
          <FormControlLabel value="stripe" control={<Radio />} label="Stripe" />
        </RadioGroup>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          {method === "paypal" && (
            <Button disabled={!isValid || busy || paypalStatus !== "ready"} variant="contained" onClick={payWithPayPal}>
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
