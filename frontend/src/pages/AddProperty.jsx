import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  useTheme,
  Paper,
} from '@mui/material';

export default function AddProperty() {
  const theme = useTheme();

  const [form, setForm] = useState({
    title: '',
    location: '',
    price: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (!form.price || form.price <= 0) newErrors.price = 'Enter a valid price';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    console.log('✅ Property Submitted:', form);
    // TODO: Send to backend/API

    // Clear form
    setForm({
      title: '',
      location: '',
      price: '',
      description: '',
    });
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        px: 3,
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#fff',
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Add New Property
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Property Title"
            name="title"
            fullWidth
            required
            margin="normal"
            value={form.title}
            onChange={handleChange}
            error={Boolean(errors.title)}
            helperText={errors.title}
          />

          <TextField
            label="Location"
            name="location"
            fullWidth
            required
            margin="normal"
            value={form.location}
            onChange={handleChange}
            error={Boolean(errors.location)}
            helperText={errors.location}
          />

          <TextField
            label="Price (USD)"
            name="price"
            type="number"
            fullWidth
            required
            margin="normal"
            value={form.price}
            onChange={handleChange}
            error={Boolean(errors.price)}
            helperText={errors.price}
            inputProps={{ min: 0 }}
          />

          <TextField
            label="Description"
            name="description"
            multiline
            rows={4}
            fullWidth
            required
            margin="normal"
            value={form.description}
            onChange={handleChange}
            error={Boolean(errors.description)}
            helperText={errors.description}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.5,
              backgroundColor: theme.palette.mode === 'dark' ? '#0ea5e9' : '#1976d2',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#0284c7' : '#1565c0',
              },
            }}
          >
            Submit Property
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
