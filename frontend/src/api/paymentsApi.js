// src/api/paymentsApi.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

// Build an axios instance so we can share headers/timeouts, etc.
const http = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

// Attach token if present
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Normalize API/Network errors
function unwrap(error) {
  const msg =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    "Request failed";
  const status = error?.response?.status ?? 0;
  const data = error?.response?.data;
  const err = new Error(msg);
  err.status = status;
  err.data = data;
  throw err;
}

/**
 * Create a PayPal order (server-side)
 * Expects backend: POST /api/payments/paypal/create/
 * Body: { amount, currency, success_url?, cancel_url? }
 * Returns: { id, ...paypalOrder }
 */
export async function createPayPalOrder(
  amount,
  currency = "USD",
  { successUrl, cancelUrl } = {}
) {
  try {
    const res = await http.post("/api/payments/paypal/create/", {
      amount,
      currency,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return res.data;
  } catch (e) {
    unwrap(e);
  }
}

/**
 * Capture a PayPal order (server-side)
 * Expects backend: POST /api/payments/paypal/capture/
 * Body: { order_id }
 */
export async function capturePayPalOrder(orderId) {
  try {
    const res = await http.post("/api/payments/paypal/capture/", {
      order_id: orderId,
    });
    return res.data;
  } catch (e) {
    unwrap(e);
  }
}

/**
 * Initialize Flutterwave payment (server-side)
 * Expects backend: POST /api/payments/flutterwave/init/
 * Body: { amount, email, tx_ref, currency?, redirect_url? }
 * Returns: { link } or inline config (depending on your backend)
 */
export async function initFlutterwavePayment({
  amount,
  email,
  txRef,
  currency = "UGX",
  redirectUrl, // where Flutterwave should return to
  meta = {},
}) {
  try {
    const res = await http.post("/api/payments/flutterwave/init/", {
      amount,
      email,
      currency,
      tx_ref: txRef || `txn_${Date.now()}`,
      redirect_url: redirectUrl,
      meta,
    });
    return res.data; // often { link: "https://..." } or inline params
  } catch (e) {
    unwrap(e);
  }
}

/**
 * Create a Stripe Checkout session (server-side)
 * Expects backend: POST /api/payments/stripe/create-checkout-session/
 * Body: { amount, currency, product_name, success_url?, cancel_url? }
 * Returns: { id } for stripe.redirectToCheckout({ sessionId: id })
 */
export async function createStripeCheckout({
  amount,
  currency = "usd",
  productName = "Real Estate Plot Reservation",
  successUrl,
  cancelUrl,
}) {
  try {
    const res = await http.post(
      "/api/payments/stripe/create-checkout-session/",
      {
        amount,
        currency,
        product_name: productName,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }
    );
    return res.data;
  } catch (e) {
    unwrap(e);
  }
}

// Optional: verify/callback endpoints if your backend exposes them
export async function verifyFlutterwaveTx(txRef) {
  try {
    const res = await http.get(`/api/payments/flutterwave/verify/${txRef}/`);
    return res.data;
  } catch (e) {
    unwrap(e);
  }
}

export async function verifyStripeSession(sessionId) {
  try {
    const res = await http.get(`/api/payments/stripe/verify/${sessionId}/`);
    return res.data;
  } catch (e) {
    unwrap(e);
  }
}

// Convenience default export so you can do `import paymentsApi from "..."`
const paymentsApi = {
  createPayPalOrder,
  capturePayPalOrder,
  initFlutterwavePayment,
  createStripeCheckout,
  verifyFlutterwaveTx,
  verifyStripeSession,
};

export default paymentsApi;
