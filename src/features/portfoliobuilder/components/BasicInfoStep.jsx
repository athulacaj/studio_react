import React, { useState } from 'react';
import {
    Box,
    TextField,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput
} from '@mui/material';

const photographyStyles = [
    'Wedding',
    'Portrait',
    'Landscape',
    'Wildlife',
    'Fashion',
    'Product',
    'Event',
    'Street',
    'Architecture',
    'Food',
    'Sports',
    'Documentary'
];

const BasicInfoStep = ({ data, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        website: data.website || '',
        photographyStyles: data.photographyStyles || [],
        experience: data.experience || '',
        tagline: data.tagline || ''
    });

    const handleChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        onUpdate(newData);
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Tell us about yourself
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Location"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="City, Country"
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Website (optional)"
                        value={formData.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                        placeholder="https://yourwebsite.com"
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Photography Styles</InputLabel>
                        <Select
                            multiple
                            value={formData.photographyStyles}
                            onChange={(e) => handleChange('photographyStyles', e.target.value)}
                            input={<OutlinedInput label="Photography Styles" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} size="small" />
                                    ))}
                                </Box>
                            )}
                        >
                            {photographyStyles.map((style) => (
                                <MenuItem key={style} value={style}>
                                    {style}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Years of Experience"
                        type="number"
                        value={formData.experience}
                        onChange={(e) => handleChange('experience', e.target.value)}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Tagline"
                        value={formData.tagline}
                        onChange={(e) => handleChange('tagline', e.target.value)}
                        placeholder="A catchy phrase that describes your work"
                        variant="outlined"
                        helperText="This will appear prominently on your portfolio"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default BasicInfoStep;
