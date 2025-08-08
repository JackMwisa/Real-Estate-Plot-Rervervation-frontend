
import React, { useState } from 'react';
import {
  Box, Button, Paper, TextField, Typography, useTheme,
  Snackbar, Alert, IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';

// Use your Vite env or fallback
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';
// Djoser default registration endpoint
const SIGNUP_URL = `${API_BASE}/api-auth-djoser/users/`;

const Signup = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [serverErrors, setServerErrors] = useState({
    username: '',
    email: '',
    password: '',
    nonField: '',
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .matches(/^[a-zA-Z0-9]+$/, 'Only letters and numbers, no spaces')
        .min(5, 'Must be at least 5 characters')
        .required('Username is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string()
        .min(8, 'Must be at least 8 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password'),
    }),
    onSubmit: async (values) => {
      setServerErrors({ username: '', email: '', password: '', nonField: '' });
      setSubmitting(true);
      try {
        const res = await fetch(SIGNUP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: values.username,
            email: values.email,
            password: values.password,
            re_password: values.confirmPassword,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          // Map common Djoser/Django errors to fields
          if (data.username) {
            setServerErrors((s) => ({ ...s, username: data.username?.[0] ?? String(data.username) }));
          }
          if (data.email) {
            setServerErrors((s) => ({ ...s, email: data.email?.[0] ?? String(data.email) }));
          }
          if (data.password) {
            // Djoser returns list of strings
            const msg = Array.isArray(data.password) ? data.password[0] : String(data.password);
            setServerErrors((s) => ({ ...s, password: msg }));
          }
          if (!data.username && !data.email && !data.password) {
            setServerErrors((s) => ({ ...s, nonField: data.detail || 'Registration failed' }));
          }
        } else {
          setSnackOpen(true);
          // brief pause, then go
          setTimeout(() => navigate('/created'), 1200);
        }
      } catch (e) {
        setServerErrors((s) => ({ ...s, nonField: 'Network error. Please try again.' }));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', mt: 6, px: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Create an account
        </Typography>

        {/* Top-level server error (non-field) */}
        {serverErrors.nonField ? (
          <Alert severity="error" sx={{ mb: 2 }}>{serverErrors.nonField}</Alert>
        ) : null}

        <form onSubmit={formik.handleSubmit} noValidate>
          <TextField
            fullWidth label="Username" name="username"
            margin="normal" required
            value={formik.values.username}
            onChange={(e) => {
              // clear server error for username on change
              if (serverErrors.username) setServerErrors((s) => ({ ...s, username: '' }));
              formik.handleChange(e);
            }}
            onBlur={formik.handleBlur}
            error={Boolean((formik.touched.username && formik.errors.username) || serverErrors.username)}
            helperText={
              (formik.touched.username && formik.errors.username) || serverErrors.username
            }
          />

          <TextField
            fullWidth label="Email" name="email" type="email"
            margin="normal" required
            value={formik.values.email}
            onChange={(e) => {
              if (serverErrors.email) setServerErrors((s) => ({ ...s, email: '' }));
              formik.handleChange(e);
            }}
            onBlur={formik.handleBlur}
            error={Boolean((formik.touched.email && formik.errors.email) || serverErrors.email)}
            helperText={
              (formik.touched.email && formik.errors.email) || serverErrors.email
            }
          />

          <TextField
            fullWidth label="Password" name="password"
            margin="normal" required
            type={showPwd ? 'text' : 'password'}
            value={formik.values.password}
            onChange={(e) => {
              if (serverErrors.password) setServerErrors((s) => ({ ...s, password: '' }));
              formik.handleChange(e);
            }}
            onBlur={formik.handleBlur}
            error={Boolean((formik.touched.password && formik.errors.password) || serverErrors.password)}
            helperText={
              (formik.touched.password && formik.errors.password) || serverErrors.password
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd((s) => !s)} edge="end" aria-label="toggle password visibility">
                    {showPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth label="Confirm Password" name="confirmPassword"
            margin="normal" required
            type={showPwd2 ? 'text' : 'password'}
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd2((s) => !s)} edge="end" aria-label="toggle confirm password visibility">
                    {showPwd2 ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={submitting || !formik.isValid || !formik.dirty}
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </Button>

          <Typography mt={2} textAlign="center" variant="body2">
            Already have an account?{' '}
            <Link to="/login" style={{ color: theme.palette.primary.main }}>
              Login
            </Link>
          </Typography>
        </form>
      </Paper>

      <Snackbar
        open={snackOpen}
        autoHideDuration={1500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          Account created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Signup;
