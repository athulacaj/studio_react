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
    OutlinedInput,
    InputAdornment,
    CircularProgress,
    Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { usePortfolioBuilder } from '../context/PortfolioBuilderContext';

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

const BasicInfoStep = ({ data, onUpdate, currentDomain, onValidityChange }) => {
    const { checkDomainAvailability } = usePortfolioBuilder();
    const [formData, setFormData] = useState({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        website: data.website || '',
        photographyStyles: data.photographyStyles || [],
        experience: data.experience || '',
        tagline: data.tagline || '',
        domain: data.domain || ''
    });
    const [domainStatus, setDomainStatus] = useState(null); // 'checking', 'available', 'taken', 'error'

    const handleChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        onUpdate(newData);
    };

    const handleDomainChange = (e) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        handleChange('domain', value);
        setDomainStatus(null);
        if (onValidityChange) onValidityChange(false);
    };

    const handleCheckDomain = async () => {
        const value = formData.domain;

        if (!value || value.length < 3) {
            return;
        }

        if (currentDomain && value === currentDomain) {
            setDomainStatus('available');
            if (onValidityChange) onValidityChange(true);
            return;
        }

        setDomainStatus('checking');
        try {
            const isAvailable = await checkDomainAvailability(value);
            setDomainStatus(isAvailable ? 'available' : 'taken');
            if (onValidityChange) onValidityChange(isAvailable);
        } catch (error) {
            console.error('Error checking domain:', error);
            setDomainStatus('error');
            if (onValidityChange) onValidityChange(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Tell us about yourself
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TextField
                            fullWidth
                            label="Portfolio Domain ID"
                            value={formData.domain}
                            onChange={handleDomainChange}
                            required
                            variant="outlined"
                            helperText={
                                domainStatus === 'available' ? 'Domain is available!' :
                                    domainStatus === 'taken' ? 'Domain is already taken' :
                                        domainStatus === 'checking' ? 'Checking availability...' :
                                            'Choose a unique ID for your portfolio (e.g., samplestudio)'
                            }
                            error={domainStatus === 'taken' || domainStatus === 'error'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {domainStatus === 'checking' && <CircularProgress size={20} />}
                                        {domainStatus === 'available' && <CheckCircleIcon color="success" />}
                                        {domainStatus === 'taken' && <ErrorIcon color="error" />}
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleCheckDomain}
                            disabled={!formData.domain || formData.domain.length < 3 || domainStatus === 'checking'}
                            sx={{ height: 56 }}
                        >
                            Check
                        </Button>
                    </Box>
                </Grid>

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
