import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Navbar from './Components/Navbar/Navbar';
import Home from './pages/Home';
import Listings from './pages/Listings';
import Agencies from './pages/Agencies';
import AddProperty from './pages/AddProperty';

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
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/add-property" element={<AddProperty />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
