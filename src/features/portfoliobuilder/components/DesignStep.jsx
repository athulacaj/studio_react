import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { Sparkles } from 'lucide-react';
import { generatePortfolioDesign } from '../../../config/gemini';

const layouts = [
    { value: 'grid', label: 'Grid Layout', description: 'Classic grid display' },
    { value: 'masonry', label: 'Masonry Layout', description: 'Pinterest-style layout' },
    { value: 'slider', label: 'Slider Layout', description: 'Full-screen slideshow' }
];

const colorSchemes = [
    { value: 'dark', label: 'Dark', primary: '#6366f1', secondary: '#a855f7' },
    { value: 'light', label: 'Light', primary: '#3b82f6', secondary: '#8b5cf6' },
    { value: 'minimal', label: 'Minimal', primary: '#000000', secondary: '#ffffff' },
    { value: 'vibrant', label: 'Vibrant', primary: '#ec4899', secondary: '#f59e0b' }
];

const moods = ['Professional', 'Creative', 'Elegant', 'Modern', 'Vintage', 'Bold'];

const DesignStep = ({ data, basicInfo, onUpdate }) => {
    const [formData, setFormData] = useState({
        layout: data.layout || 'grid',
        colorScheme: data.colorScheme || 'dark',
        mood: data.mood || 'Professional',
        customColors: data.customColors || null,
        aiGenerated: data.aiGenerated || false
    });
    const [generating, setGenerating] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        onUpdate(newData);
    };

    const handleGenerateAI = async () => {
        setGenerating(true);
        setError(null);
        try {
            const suggestion = await generatePortfolioDesign({
                photographyStyle: basicInfo.photographyStyles?.join(', ') || 'General',
                targetAudience: 'Potential clients and art enthusiasts',
                colorPreference: formData.colorScheme,
                mood: formData.mood
            });

            setAiSuggestion(suggestion);

            // Apply AI suggestions
            const newData = {
                ...formData,
                customColors: suggestion.colorPalette,
                aiGenerated: true,
                aiSuggestion: suggestion
            };
            setFormData(newData);
            onUpdate(newData);
        } catch (err) {
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Choose Your Design
                </Typography>
                <Button
                    variant="contained"
                    startIcon={generating ? <CircularProgress size={20} /> : <Sparkles size={20} />}
                    onClick={handleGenerateAI}
                    disabled={generating || !basicInfo.photographyStyles?.length}
                    sx={{
                        background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                    }}
                >
                    {generating ? 'Generating...' : 'AI Design Suggestions'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {aiSuggestion && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        AI Design Notes:
                    </Typography>
                    <Typography variant="body2">
                        {aiSuggestion.designNotes}
                    </Typography>
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Layout Style</InputLabel>
                        <Select
                            value={formData.layout}
                            onChange={(e) => handleChange('layout', e.target.value)}
                            label="Layout Style"
                        >
                            {layouts.map((layout) => (
                                <MenuItem key={layout.value} value={layout.value}>
                                    <Box>
                                        <Typography variant="body1">{layout.label}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {layout.description}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Color Scheme</InputLabel>
                        <Select
                            value={formData.colorScheme}
                            onChange={(e) => handleChange('colorScheme', e.target.value)}
                            label="Color Scheme"
                        >
                            {colorSchemes.map((scheme) => (
                                <MenuItem key={scheme.value} value={scheme.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 1,
                                                background: `linear-gradient(45deg, ${scheme.primary}, ${scheme.secondary})`
                                            }}
                                        />
                                        {scheme.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Mood</InputLabel>
                        <Select
                            value={formData.mood}
                            onChange={(e) => handleChange('mood', e.target.value)}
                            label="Mood"
                        >
                            {moods.map((mood) => (
                                <MenuItem key={mood} value={mood}>
                                    {mood}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {formData.customColors && (
                    <Grid item xs={12}>
                        <Card sx={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Sparkles size={20} />
                                    AI-Generated Color Palette
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                                    {Object.entries(formData.customColors).map(([key, value]) => (
                                        <Box key={key} sx={{ textAlign: 'center' }}>
                                            <Box
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: 2,
                                                    backgroundColor: value,
                                                    border: '2px solid',
                                                    borderColor: 'divider',
                                                    mb: 1
                                                }}
                                            />
                                            <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                                {key}
                                            </Typography>
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                {value}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Layout Preview
                    </Typography>
                    <Grid container spacing={2}>
                        {layouts.map((layout) => (
                            <Grid item xs={12} md={4} key={layout.value}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        border: 2,
                                        borderColor: formData.layout === layout.value ? 'primary.main' : 'transparent',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            transform: 'translateY(-4px)'
                                        }
                                    }}
                                    onClick={() => handleChange('layout', layout.value)}
                                >
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {layout.label}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {layout.description}
                                        </Typography>
                                        {formData.layout === layout.value && (
                                            <Chip label="Selected" color="primary" size="small" sx={{ mt: 1 }} />
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DesignStep;
