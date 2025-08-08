import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

/**
 * Create a PayPal order (server-side)
 * returns: { id, ... } from your Django endpoint
 */
export async function createPayPalOrder(amount, currency = "USD") {
  const res = await axios.post(`${API_BASE}/api/payments/paypal/create/`, {
    amount,
    currency,
  });
  return res.data;
}

/**
 * Capture a PayPal order (server-side)
 */
export async function capturePayPalOrder(orderId) {
  const res = await axios.post(`${API_BASE}/api/payments/paypal/capture/`, {
    order_id: orderId,
  });
  return res.data;
}

/**
 * Initialize a Flutterwave payment (server-side)
 * The backend should return a link or data for inline checkout
 */
export async function initFlutterwavePayment(amount, email) {
  const res = await axios.post(`${API_BASE}/api/payments/flutterwave/init/`, {
    amount,
    email,
    tx_ref: `txn_${Date.now()}`,
  });
  return res.data;
}

/**
 * Create a Stripe Checkout session (server-side)
 * returns: { id } which you pass to stripe.redirectToCheckout
 */
export async function createStripeCheckout(amount, currency = "usd") {
  const res = await axios.post(
    `${API_BASE}/api/payments/stripe/create-checkout-session/`,
    {
      amount,
      currency,
      product_name: "Real Estate Plot Reservation",
    }
  );
  return res.data;
}
