import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    IconButton,
    TextField,
    InputAdornment,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    Chip,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    Close as CloseIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    AutoAwesome as SparklesIcon,
    CheckCircle as CheckIcon,
    Visibility as PreviewIcon,
    Layers as TemplatesIcon,
} from '@mui/icons-material';
import { WebsiteTemplate } from '../api/WebsiteService';

interface TemplateSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    templates: WebsiteTemplate[];
    onSelectTemplate: (template: WebsiteTemplate) => void;
    isLoading?: boolean;
}

export const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
    open,
    onClose,
    templates,
    onSelectTemplate,
    isLoading = false,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypeId, setSelectedTypeId] = useState<string>('all');
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

    // Extract unique template types for category tabs
    const categories = useMemo(() => {
        const types = Array.from(new Set(templates.map((t) => t.type).filter(Boolean)));
        return ['all', ...types];
    }, [templates]);

    // Filter templates based on search query and selected category
    const filteredTemplates = useMemo(() => {
        return templates.filter((template) => {
            const matchesCategory =
                selectedTypeId === 'all' || template.type.toLowerCase() === selectedTypeId.toLowerCase();

            const query = searchQuery.toLowerCase().trim();
            if (!query) return matchesCategory;

            const matchesSearch =
                template.type.toLowerCase().includes(query) ||
                template.id.toString().includes(query) ||
                template.url.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [templates, searchQuery, selectedTypeId]);

    const handleSelect = (template: WebsiteTemplate) => {
        setSelectedTemplateId(template.id);
        onSelectTemplate(template);
    };

    const formatCategoryName = (typeStr: string) => {
        if (typeStr === 'all') return 'All Templates';
        return typeStr
            .replace(/__/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 5,
                        bgcolor: '#0B132B',
                        backgroundImage: 'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.15), transparent 70%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                    },
                }}
            >
                {/* Dialog Header */}
                <DialogTitle
                    sx={{
                        p: 3,
                        pb: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                                sx={{
                                    p: 1.2,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <SparklesIcon sx={{ color: '#C084FC', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700, letterSpacing: '-0.02em' }}>
                                    Template Library
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                    Choose a pre-built template to start customizing your portfolio
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: '#94A3B8',
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#FFF' },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Controls Row: Search & Category Chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                        <TextField
                            size="small"
                            placeholder="Search templates by name, type, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                width: { xs: '100%', sm: 340 },
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(15, 23, 42, 0.8)',
                                    borderRadius: 3,
                                    color: '#FFF',
                                    fontSize: '0.875rem',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                                    '&:hover fieldset': { borderColor: 'rgba(192, 132, 252, 0.4)' },
                                    '&.Mui-focused fieldset': { borderColor: '#A855F7' },
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ color: '#94A3B8' }}>
                                            <ClearIcon size="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                            }}
                        />

                        {/* Category Filter Chips */}
                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5 }}>
                            {categories.map((cat) => {
                                const isSelected = selectedTypeId === cat;
                                return (
                                    <Chip
                                        key={cat}
                                        label={formatCategoryName(cat)}
                                        onClick={() => setSelectedTypeId(cat)}
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            borderRadius: 2,
                                            px: 1,
                                            bgcolor: isSelected
                                                ? 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)'
                                                : 'rgba(255, 255, 255, 0.05)',
                                            color: isSelected ? '#FFF' : '#94A3B8',
                                            border: isSelected
                                                ? '1px solid rgba(168, 85, 247, 0.5)'
                                                : '1px solid rgba(255, 255, 255, 0.08)',
                                            '&:hover': {
                                                bgcolor: isSelected ? undefined : 'rgba(255, 255, 255, 0.1)',
                                                color: '#FFF',
                                            },
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    </Box>
                </DialogTitle>

                {/* Dialog Content Grid */}
                <DialogContent sx={{ p: 3, pt: 3, bgcolor: 'rgba(3, 9, 18, 0.4)' }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
                            <CircularProgress sx={{ color: '#C084FC' }} />
                            <Typography sx={{ color: '#94A3B8' }}>Loading template content...</Typography>
                        </Box>
                    ) : filteredTemplates.length === 0 ? (
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 8,
                                px: 2,
                                bgcolor: 'rgba(15, 23, 42, 0.4)',
                                borderRadius: 4,
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                            }}
                        >
                            <TemplatesIcon sx={{ fontSize: 48, color: '#475569', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>
                                No Templates Found
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 400, mx: 'auto' }}>
                                {templates.length === 0
                                    ? 'There are no templates available in the library at the moment.'
                                    : 'No templates match your search criteria. Try clearing search query or changing category filter.'}
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3} paddingTop={6}>
                            {filteredTemplates.map((template) => {
                                const previewImg = template.desktopScreenshotUrl || template.mobileScreenshotUrl;
                                const isSelected = selectedTemplateId === template.id;

                                return (
                                    <Grid item xs={12} sm={6} md={4} key={template.id}>
                                        <Card
                                            sx={{
                                                p: 3,
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                bgcolor: 'rgba(15, 26, 46, 0.7)',
                                                backdropFilter: 'blur(12px)',
                                                borderRadius: 4,
                                                border: isSelected
                                                    ? '2px solid #C084FC'
                                                    : '1px solid rgba(255, 255, 255, 0.08)',
                                                boxShadow: isSelected
                                                    ? '0 0 25px rgba(168, 85, 247, 0.35)'
                                                    : '0 10px 30px rgba(0, 0, 0, 0.3)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    transform: 'translateY(-6px)',
                                                    borderColor: 'rgba(192, 132, 252, 0.5)',
                                                    boxShadow: '0 15px 35px rgba(124, 58, 237, 0.25)',
                                                    '& .template-overlay': { opacity: 1 },
                                                },
                                            }}
                                        >
                                            {/* Preview Header / Screenshot Box */}
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    height: 180,
                                                    bgcolor: '#030912',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {previewImg ? (
                                                    <CardMedia
                                                        component="img"
                                                        height="180"
                                                        image={previewImg}
                                                        alt={`Template ${template.id}`}
                                                        sx={{ objectFit: 'cover', objectPosition: 'top' }}
                                                    />
                                                ) : (
                                                    /* Dynamic Decorative Fallback Preview Frame */
                                                    <Box
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            p: 2,
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 50,
                                                                height: 50,
                                                                borderRadius: '50%',
                                                                bgcolor: 'rgba(124, 58, 237, 0.2)',
                                                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                mb: 1.5,
                                                            }}
                                                        >
                                                            <SparklesIcon sx={{ color: '#C084FC', fontSize: 26 }} />
                                                        </Box>
                                                        <Typography variant="subtitle2" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                                                            {formatCategoryName(template.type)}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5 }}>
                                                            Template #{template.id}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Hover Overlay */}
                                                <Box
                                                    className="template-overlay"
                                                    sx={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        bgcolor: 'rgba(3, 9, 18, 0.85)',
                                                        backdropFilter: 'blur(4px)',
                                                        opacity: 0,
                                                        transition: 'opacity 0.25s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: 1.5,
                                                        p: 2,
                                                    }}
                                                >
                                                    {previewImg && (
                                                        <Tooltip title="View Full Preview Image">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPreviewImageUrl(previewImg);
                                                                }}
                                                                sx={{
                                                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                                    color: '#FFF',
                                                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
                                                                }}
                                                            >
                                                                <PreviewIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<CheckIcon />}
                                                        onClick={() => handleSelect(template)}
                                                        sx={{
                                                            background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                                                            borderRadius: 2,
                                                            fontWeight: 600,
                                                            px: 2.5,
                                                            py: 1,
                                                            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                                                        }}
                                                    >
                                                        Use Template
                                                    </Button>
                                                </Box>

                                                {/* Type Badge */}
                                                <Chip
                                                    label={formatCategoryName(template.type)}
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 12,
                                                        left: 12,
                                                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                                                        backdropFilter: 'blur(8px)',
                                                        color: '#E2E8F0',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    }}
                                                />
                                            </Box>

                                            {/* Card Footer Info */}
                                            <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ color: '#FFF', fontWeight: 600, mb: 0.5 }}>
                                                        {formatCategoryName(template.type)} #{template.id}
                                                    </Typography>
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        onClick={() => window.open(template.url, "_blank")}
                                                        sx={{
                                                            color: "#94A3B8",
                                                            textTransform: "none",
                                                            minWidth: "auto",
                                                            p: 0,
                                                            fontFamily: "monospace",
                                                            justifyContent: "flex-start",
                                                            "&:hover": {
                                                                backgroundColor: "transparent",
                                                                textDecoration: "underline",
                                                            },
                                                        }}
                                                    >
                                                        View Live
                                                    </Button>
                                                </Box>

                                                <Button
                                                    fullWidth
                                                    variant={isSelected ? 'contained' : 'outlined'}
                                                    onClick={() => handleSelect(template)}
                                                    sx={{
                                                        mt: 2,
                                                        borderRadius: 2.5,
                                                        py: 1,
                                                        fontWeight: 600,
                                                        fontSize: '0.85rem',
                                                        ...(isSelected
                                                            ? {
                                                                background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                                                                color: '#FFF',
                                                            }
                                                            : {
                                                                borderColor: 'rgba(255, 255, 255, 0.15)',
                                                                color: '#CBD5E1',
                                                                '&:hover': {
                                                                    borderColor: '#A855F7',
                                                                    bgcolor: 'rgba(168, 85, 247, 0.08)',
                                                                    color: '#FFF',
                                                                },
                                                            }),
                                                    }}
                                                >
                                                    {isSelected ? 'Selected' : 'Select Template'}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </DialogContent>
            </Dialog>

            {/* Image Preview Lightbox Dialog */}
            {previewImageUrl && (
                <Dialog
                    open={Boolean(previewImageUrl)}
                    onClose={() => setPreviewImageUrl(null)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{ sx: { bgcolor: '#000', borderRadius: 4, overflow: 'hidden' } }}
                >
                    <Box sx={{ position: 'relative', p: 1, textAlign: 'center' }}>
                        <IconButton
                            onClick={() => setPreviewImageUrl(null)}
                            sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                color: '#FFF',
                                zIndex: 10,
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.9)' },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Box
                            component="img"
                            src={previewImageUrl}
                            alt="Template Full Preview"
                            sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 2 }}
                        />
                    </Box>
                </Dialog>
            )}
        </>
    );
};

export default TemplateSelectionDialog;
