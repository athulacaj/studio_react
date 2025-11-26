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
    Chip,
    TextField,
    Popover,
    IconButton,
    Tooltip
} from '@mui/material';
import { Sparkles, Palette, Edit2, FileText } from 'lucide-react';
import { generatePortfolioDesign } from '../../../config/gemini';
import { fetchTemplate, getAvailableTemplates } from '../utils/templateUtils';

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
        aiGenerated: data.aiGenerated || false,
        templateName: data.templateName || null,
        templateHtml: data.templateHtml || null
    });
    const [generating, setGenerating] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [error, setError] = useState(null);
    const [loadingTemplate, setLoadingTemplate] = useState(false);

    // Color picker state
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
    const [selectedColorKey, setSelectedColorKey] = useState(null);
    const [tempColorValue, setTempColorValue] = useState('');

    const handleChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        onUpdate(newData);
    };

    const handleOpenColorPicker = (event, colorKey, currentValue) => {
        setColorPickerAnchor(event.currentTarget);
        setSelectedColorKey(colorKey);
        setTempColorValue(currentValue);
    };

    const handleCloseColorPicker = () => {
        setColorPickerAnchor(null);
        setSelectedColorKey(null);
        setTempColorValue('');
    };

    const handleColorChange = (newColor) => {
        setTempColorValue(newColor);
    };

    const handleApplyColor = () => {
        if (selectedColorKey && tempColorValue) {
            const newColors = {
                ...(formData.customColors || getDefaultColorPalette()),
                [selectedColorKey]: tempColorValue
            };
            handleChange('customColors', newColors);
        }
        handleCloseColorPicker();
    };

    const getDefaultColorPalette = () => {
        return {
            primary: '#1A141A',
            secondary: '#6A7F8E',
            accent: '#E09F77',
            background: '#0E0E0E',
            text: '#F0F0F0'
        };
    };

    const handleCreateManualPalette = () => {
        if (!formData.customColors) {
            handleChange('customColors', getDefaultColorPalette());
        }
    };

    const handleTemplateChange = async (templateName) => {
        if (!templateName) {
            // Clear template if 'none' is selected
            const newData = {
                ...formData,
                templateName: null,
                templateHtml: null
            };
            setFormData(newData);
            onUpdate(newData);
            return;
        }

        setLoadingTemplate(true);
        setError(null);

        try {
            const htmlContent = await fetchTemplate(templateName);
            const newData = {
                ...formData,
                templateName,
                templateHtml: htmlContent
            };
            setFormData(newData);
            onUpdate(newData);
        } catch (err) {
            console.error('Error loading template:', err);
            setError(`Failed to load ${templateName} template. Please try again.`);
        } finally {
            setLoadingTemplate(false);
        }
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

    const colorPickerOpen = Boolean(colorPickerAnchor);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Choose Your Design
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {!formData.customColors && (
                        <Button
                            variant="outlined"
                            startIcon={<Palette size={20} />}
                            onClick={handleCreateManualPalette}
                            sx={{
                                borderColor: '#10b981',
                                color: '#10b981',
                                '&:hover': {
                                    borderColor: '#059669',
                                    background: 'rgba(16, 185, 129, 0.1)'
                                }
                            }}
                        >
                            Create Custom Palette
                        </Button>
                    )}
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

            {/* Template Selection */}
            <Card
                sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <FileText size={24} color="#6366f1" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Portfolio Template
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Choose a professionally designed template or use the default builder layout
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Template</InputLabel>
                        <Select
                            value={formData.templateName || ''}
                            onChange={(e) => handleTemplateChange(e.target.value)}
                            label="Template"
                            disabled={loadingTemplate}
                        >
                            <MenuItem value="">
                                <Box>
                                    <Typography variant="body1">Default Builder</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Use the standard portfolio builder layout
                                    </Typography>
                                </Box>
                            </MenuItem>
                            {getAvailableTemplates().map((template) => (
                                <MenuItem
                                    key={template.value}
                                    value={template.value}
                                    disabled={template.disabled}
                                >
                                    <Box>
                                        <Typography variant="body1">
                                            {template.label}
                                            {template.disabled && (
                                                <Chip
                                                    label="Coming Soon"
                                                    size="small"
                                                    sx={{ ml: 1, height: 20 }}
                                                />
                                            )}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {template.description}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {loadingTemplate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                            <CircularProgress size={16} />
                            <Typography variant="body2" color="text.secondary">
                                Loading template...
                            </Typography>
                        </Box>
                    )}
                    {formData.templateName && formData.templateHtml && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                ✓ {formData.templateName.charAt(0).toUpperCase() + formData.templateName.slice(1)} template loaded successfully
                            </Typography>
                        </Alert>
                    )}
                </CardContent>
            </Card>

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
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                                border: '1px solid rgba(99, 102, 241, 0.2)'
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {formData.aiGenerated ? <Sparkles size={20} /> : <Palette size={20} />}
                                        {formData.aiGenerated ? 'AI-Generated' : 'Custom'} Color Palette
                                    </Typography>
                                    <Chip
                                        icon={<Edit2 size={14} />}
                                        label="Click colors to edit"
                                        size="small"
                                        variant="outlined"
                                        sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
                                    {Object.entries(formData.customColors).map(([key, value]) => (
                                        <Tooltip key={key} title="Click to change color" arrow>
                                            <Box
                                                sx={{
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s',
                                                    '&:hover': {
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}
                                                onClick={(e) => handleOpenColorPicker(e, key, value)}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: 2,
                                                        backgroundColor: value,
                                                        border: '3px solid',
                                                        borderColor: 'divider',
                                                        mb: 1,
                                                        position: 'relative',
                                                        '&:hover::after': {
                                                            content: '"✎"',
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            fontSize: 24,
                                                            color: value === '#000000' || value === '#0E0E0E' ? '#fff' : '#000',
                                                            textShadow: '0 0 4px rgba(0,0,0,0.5)'
                                                        }
                                                    }}
                                                />
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                                    {key}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    {value}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
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

            {/* Color Picker Popover */}
            <Popover
                open={colorPickerOpen}
                anchorEl={colorPickerAnchor}
                onClose={handleCloseColorPicker}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box sx={{ p: 3, width: 300 }}>
                    <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
                        Edit {selectedColorKey} Color
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Color (Hex)"
                            value={tempColorValue}
                            onChange={(e) => handleColorChange(e.target.value)}
                            placeholder="#000000"
                            InputProps={{
                                startAdornment: (
                                    <Box
                                        sx={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: 1,
                                            backgroundColor: tempColorValue,
                                            border: '2px solid',
                                            borderColor: 'divider',
                                            mr: 1
                                        }}
                                    />
                                )
                            }}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Or use the color picker:
                        </Typography>
                        <input
                            type="color"
                            value={tempColorValue}
                            onChange={(e) => handleColorChange(e.target.value)}
                            style={{
                                width: '100%',
                                height: 50,
                                border: '2px solid #ccc',
                                borderRadius: 8,
                                cursor: 'pointer'
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button onClick={handleCloseColorPicker} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={handleApplyColor} variant="contained">
                            Apply
                        </Button>
                    </Box>
                </Box>
            </Popover >
        </Box >
    );
};

export default DesignStep;
