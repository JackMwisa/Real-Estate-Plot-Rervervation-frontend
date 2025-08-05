import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  useTheme,
  Paper,
  Fade,
  Divider,
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
  const [submitted, setSubmitted] = useState(false);

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

    // Clear form and show feedback
    setSubmitted(true);
    setForm({
      title: '',
      location: '',
      price: '',
      description: '',
    });

    setTimeout(() => setSubmitted(false), 2000); // Reset submission feedback
  };

  return (
    <Fade in>
      <Box
        sx={{
          maxWidth: 700,
          mx: 'auto',
          mt: 6,
          px: { xs: 2, sm: 4 },
          pb: 6,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            backgroundColor:
              theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" fontWeight={600} mb={1}>
            Add New Property
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            mb={3}
          >
            Fill in the details below to list a property.
          </Typography>

          <Divider sx={{ mb: 3 }} />

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
              size="large"
              variant="contained"
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: 600,
                backgroundColor: theme.palette.mode === 'dark' ? '#0ea5e9' : '#4CAF50',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#0284c7' : '#43a047',
                },
              }}
            >
              Submit Property
            </Button>

            {submitted && (
              <Typography
                variant="body2"
                color="success.main"
                align="center"
                mt={2}
              >
                ✅ Property submitted successfully!
              </Typography>
            )}
          </form>
        </Paper>
      </Box>
    </Fade>
  );
}
