import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';

export default function Signup() {
  const theme = useTheme();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signing up with:', form);
    // TODO: Send to backend
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 6, px: 2 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" mb={2} fontWeight="bold">Create Account</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            name="name"
            fullWidth
            margin="normal"
            required
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            name="email"
            fullWidth
            margin="normal"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            label="Password"
            name="password"
            fullWidth
            margin="normal"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Sign Up
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
