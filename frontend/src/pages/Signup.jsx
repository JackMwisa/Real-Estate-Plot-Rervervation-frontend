import React from 'react';
import {
  Box, Button, Paper, TextField, Typography, useTheme
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

const Signup = () => {
  const theme = useTheme();

  const formik = useFormik({
    initialValues: {
      fullName: '', email: '', password: '', confirmPassword: ''
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required('Full name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().min(6).required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password'),
    }),
    onSubmit: (values) => {
      console.log('Signup:', values);
      // TODO: Handle registration
    },
  });

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 6, px: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>Sign Up</Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth label="Full Name" name="fullName"
            margin="normal" required
            value={formik.values.fullName}
            onChange={formik.handleChange}
            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
            helperText={formik.touched.fullName && formik.errors.fullName}
          />
          <TextField
            fullWidth label="Email" name="email"
            margin="normal" required
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth label="Password" name="password" type="password"
            margin="normal" required
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            fullWidth label="Confirm Password" name="confirmPassword" type="password"
            margin="normal" required
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Create Account
          </Button>
          <Typography mt={2} textAlign="center" variant="body2">
            Already have an account?{' '}
            <Link to="/login" style={{ color: theme.palette.primary.main }}>Login</Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Signup;
