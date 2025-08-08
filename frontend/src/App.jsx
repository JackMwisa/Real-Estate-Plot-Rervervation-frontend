import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import Home from './pages/Home';
import Listings from './pages/Listings/Listings.tsx';
import ListingDetail from './pages/Listings/ListingDetail';
import Agencies from './pages/Agencies';
import AddProperty from './pages/Property/AddProperty';
import Login from './pages/Login';
import Signup from './pages//Auth/Signup';
import Profile from './pages/Profile';
import AgencyDetail from './pages/AgencyDetail';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#0a2540' : '#4CAF50',
      },
      background: {
        default: darkMode ? '#0a2540' : '#f0fff4',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/agencies/:id" element={<AgencyDetail />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pay" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
        </Routes>
        <Footer darkMode={darkMode} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
