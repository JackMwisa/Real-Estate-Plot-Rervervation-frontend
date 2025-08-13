// src/App.jsx
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";

import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

// Lazy pages
const Home = lazy(() => import("./pages/Home"));
const Listings = lazy(() => import("./pages/Listings/index.tsx"));            // <-- now points to pages/Listings/index.tsx
const ListingDetail = lazy(() => import("./pages/Listings/ListingDetail"));
const Agencies = lazy(() => import("./pages/Agencies"));
const AgencyDetail = lazy(() => import("./pages/AgencyDetail"));
const AddProperty = lazy(() => import("./pages/Property/AddProperty"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Auth/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));

// Simple 404
function NotFound() {
  return <div style={{ padding: 24 }}>Page not found.</div>;
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// Simple suspense fallback
function PageLoader() {
  return (
    <Box sx={{ p: 4, display: "grid", placeItems: "center" }}>
      <span>Loading…</span>
    </Box>
  );
}

export default function App() {
  // Prefer system scheme first, then user’s saved choice
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pref_theme");
    if (saved === "dark" || saved === "light") {
      setDarkMode(saved === "dark");
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("pref_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  let theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: darkMode ? "#0a2540" : "#4CAF50" },
          background: { default: darkMode ? "#0a2540" : "#f0fff4" },
        },
      }),
    [darkMode]
  );
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ScrollToTop />
        <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode((v) => !v)} />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Public */}
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/agencies" element={<Agencies />} />
            <Route path="/agencies/:id" element={<AgencyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Payments */}
            <Route path="/pay" element={<PaymentPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />

            {/* Private */}
            <Route
              path="/add-property"
              element={
                <ProtectedRoute>
                  <AddProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        <Footer darkMode={darkMode} />
      </BrowserRouter>
    </ThemeProvider>
  );
}
