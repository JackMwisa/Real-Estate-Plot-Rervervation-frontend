// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import ProtectedRoute from "./Components/ProtectedRoute.jsx"; 

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Home from "./pages/Home";
import Listings from "./pages/Listings/Listings.tsx";
import ListingDetail from "./pages/Listings/ListingDetail";
import Agencies from "./pages/Agencies";
import AddProperty from "./pages/Property/AddProperty";
import Login from "./pages/Login";
import Signup from "./pages/Auth/Signup"; // fixed double slash
import Profile from "./pages/Profile";
import AgencyDetail from "./pages/AgencyDetail";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

// Simple 404
function NotFound() {
  return <div style={{ padding: 24 }}>Page not found.</div>;
}

// Scroll to top on route change
import { useLocation } from "react-router-dom";
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // (Optional) persist theme
  useEffect(() => {
    const saved = localStorage.getItem("pref_theme");
    if (saved) setDarkMode(saved === "dark");
  }, []);
  useEffect(() => {
    localStorage.setItem("pref_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  let theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#0a2540" : "#4CAF50",
      },
      background: {
        default: darkMode ? "#0a2540" : "#f0fff4",
      },
    },
  });
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ScrollToTop />
        <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode((v) => !v)} />

        <Routes>
          <Route path="/" element={<Home />} />

          {/* Public */}
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/agencies/:id" element={<AgencyDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Payments (public or gated as you prefer) */}
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

        <Footer darkMode={darkMode} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
