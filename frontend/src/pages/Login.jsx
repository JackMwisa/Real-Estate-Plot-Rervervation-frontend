import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';

const Login = () => {
  const theme = useTheme();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in:', form);
    // TODO: handle authentication
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6, px: 3 }}>
      <Paper elevation={3} sx={{ p: 4, backgroundColor: theme.palette.background.paper }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>Login</Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth margin="normal" required
            label="Email" name="email" type="email"
            value={form.email} onChange={handleChange}
          />
          <TextField
            fullWidth margin="normal" required
            label="Password" name="password" type="password"
            value={form.password} onChange={handleChange}
          />
          <Button
            type="submit" variant="contained" fullWidth sx={{ mt: 2 }}
          >
            Login
          </Button>
          <Typography mt={2} textAlign="center" variant="body2">
            Don’t have an account?{' '}
            <Link to="/signup" style={{ color: theme.palette.primary.main }}>Sign Up</Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
