import React, { useState } from 'react';
import {
    Box,
    TextField,
    Typography,
    Button,
    useTheme,
    Paper,
    MenuItem,
    Snackbar,
    Alert,
    InputLabel,
    FormControl,
    Select,
} from '@mui/material';

const propertyTypes = ['Apartment', 'House', 'Land', 'Commercial', 'Other'];

export default function AddProperty() {
    const theme = useTheme();

    const [form, setForm] = useState({
        title: '',
        location: '',
        price: '',
        description: '',
        type: '',
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm((prev) => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = 'Title is required';
        if (!form.location.trim()) newErrors.location = 'Location is required';
        if (!form.price || form.price <= 0) newErrors.price = 'Enter a valid price';
        if (!form.description.trim()) newErrors.description = 'Description is required';
        if (!form.type) newErrors.type = 'Select a property type';
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
        setSnackbarOpen(true);

        // Clear form
        setForm({
            title: '',
            location: '',
            price: '',
            description: '',
            type: '',
            image: null,
        });
        setImagePreview(null);
    };

    return (
        <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, px: 2 }}>
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

                    <FormControl fullWidth required margin="normal" error={Boolean(errors.type)}>
                        <InputLabel>Property Type</InputLabel>
                        <Select
                            name="type"
                            value={form.type}
                            label="Property Type"
                            onChange={handleChange}
                        >
                            {propertyTypes.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                        {errors.type && (
                            <Typography variant="caption" color="error">
                                {errors.type}
                            </Typography>
                        )}
                    </FormControl>

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

                    <Box mt={2}>
                        <Typography variant="body1" mb={1}>
                            Upload Image
                        </Typography>
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                        {imagePreview && (
                            <Box mt={2}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                                />
                            </Box>
                        )}
                    </Box>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 4,
                            py: 1.5,
                            backgroundColor: theme.palette.mode === 'dark' ? '#0ea5e9' : '#4CAF50',
                            '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark' ? '#0284c7' : '#43a047',
                            },
                        }}
                    >
                        Submit Property
                    </Button>
                </form>
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
                    Property submitted successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
}




