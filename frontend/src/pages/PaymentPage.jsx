import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "axios";
import {
  Box, Paper, Typography, Button, ToggleButton, ToggleButtonGroup,
  Snackbar, Alert, CircularProgress
} from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

function getAuthHeader() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Token ${token}` } : {};
}

export default function PaymentPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState("flutterwave"); // "flutterwave" | "paypal"
  const [currency, setCurrency] = useState("UGX"); // "UGX" or "USD"
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [paymentId, setPaymentId] = useState(null);
  const [paypalOrderId, setPaypalOrderId] = useState(null);

  // Load PayPal SDK only when needed
  useEffect(() => {
    if (provider !== "paypal") return;
    if (document.getElementById("paypal-sdk")) return;

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "YOUR-PAYPAL-CLIENT-ID";
    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // optional: cleanup
    };
  }, [provider, currency]);

  const startCheckout = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    setPaypalOrderId(null);
    setPaymentId(null);

    try {
      const res = await Axios.post(
        `${API_BASE}/api/payments/checkout/`,
        { listing_id: Number(listingId), provider, currency },
        { headers: { ...getAuthHeader() } }
      );

      if (provider === "flutterwave") {
        const { redirect_url, payment_id } = res.data;
        setPaymentId(payment_id);
        window.location.href = redirect_url; // off you go to hosted page
        return;
      }

      // PayPal:
      const { paypal_order_id, payment_id } = res.data;
      setPaymentId(payment_id);
      setPaypalOrderId(paypal_order_id);
      setSnack({ open: true, msg: "PayPal order created. Click the PayPal button.", sev: "info" });
    } catch (e) {
      setSnack({ open: true, msg: e?.response?.data?.detail || "Checkout failed", sev: "error" });
    } finally {
      setLoading(false);
    }
  }, [listingId, provider, currency]);

  // Render PayPal Buttons if we have an order
  useEffect(() => {
    if (provider !== "paypal") return;
    if (!paypalOrderId || !paymentId) return;
    const sdk = window.paypal;
    if (!sdk || !sdk.Buttons) return;

    const containerId = "paypal-buttons-container";
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = ""; // reset
    sdk.Buttons({
      createOrder: async () => {
        // We already created the order; return the existing id
        try {
          const resp = await Axios.post(
            `${API_BASE}/api/payments/paypal/create/`,
            { payment_id: paymentId, currency },
            { headers: { ...getAuthHeader() } }
          );
          return resp.data.order_id;
        } catch (e) {
          setSnack({ open: true, msg: "Failed to create order", sev: "error" });
          throw e;
        }
      },
      onApprove: async (data) => {
        try {
          const resp = await Axios.post(
            `${API_BASE}/api/payments/paypal/capture/`,
            { payment_id: paymentId, order_id: data.orderID },
            { headers: { ...getAuthHeader() } }
          );
          if (resp.data.status === "successful") {
            setSnack({ open: true, msg: "Payment successful!", sev: "success" });
            setTimeout(() => navigate(`/payment-result?status=successful&payment_id=${paymentId}`), 800);
          } else {
            setSnack({ open: true, msg: "Payment failed.", sev: "error" });
          }
        } catch (e) {
          setSnack({ open: true, msg: "Capture failed", sev: "error" });
        }
      },
      onCancel: () => setSnack({ open: true, msg: "Payment cancelled", sev: "warning" }),
      onError: (err) => setSnack({ open: true, msg: "PayPal error", sev: "error" }),
    }).render(`#${containerId}`);
  }, [provider, paypalOrderId, paymentId, currency, navigate]);

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="800" gutterBottom>
          Reserve / Viewing Fee
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Select a payment method to reserve this property.
        </Typography>

        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <ToggleButtonGroup value={provider} exclusive onChange={(_, v) => v && setProvider(v)}>
            <ToggleButton value="flutterwave">Flutterwave</ToggleButton>
            <ToggleButton value="paypal">PayPal</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup value={currency} exclusive onChange={(_, v) => v && setCurrency(v)}>
            <ToggleButton value="UGX">UGX</ToggleButton>
            <ToggleButton value="USD">USD</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Button variant="contained" onClick={startCheckout} disabled={loading}>
            {loading ? "Starting…" : "Start Checkout"}
          </Button>
          {provider === "paypal" && (
            <Typography variant="caption" color="text.secondary">
              PayPal will show a button below after creating an order.
            </Typography>
          )}
        </Box>

        {provider === "paypal" && (
          <Box sx={{ mt: 3 }}>
            <div id="paypal-buttons-container" />
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} variant="filled" sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
