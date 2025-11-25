import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Button,
    Grid,
    Chip,
    IconButton,
    Container,
    AppBar,
    Toolbar,
    Tabs,
    Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

const PreviewStep = ({ portfolioData }) => {
    const [viewMode, setViewMode] = useState('desktop');
    const [activeTab, setActiveTab] = useState(0);

    const { basicInfo, design, content, gallery } = portfolioData;

    const getColorScheme = () => {
        if (design.customColors) {
            return design.customColors;
        }

        const schemes = {
            dark: { primary: '#6366f1', secondary: '#a855f7', background: '#0f172a', text: '#f8fafc' },
            light: { primary: '#3b82f6', secondary: '#8b5cf6', background: '#ffffff', text: '#1e293b' },
            minimal: { primary: '#000000', secondary: '#ffffff', background: '#ffffff', text: '#000000' },
            vibrant: { primary: '#ec4899', secondary: '#f59e0b', background: '#1e293b', text: '#f8fafc' }
        };

        return schemes[design.colorScheme] || schemes.dark;
    };

    const colors = getColorScheme();

    const renderGallery = () => {
        if (!gallery || gallery.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No images in gallery yet
                    </Typography>
                </Box>
            );
        }

        switch (design.layout) {
            case 'masonry':
                return (
                    <Grid container spacing={2}>
                        {gallery.map((image, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Box
                                        component="img"
                                        src={image.url}
                                        alt={image.title}
                                        sx={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: 2,
                                            transition: 'transform 0.3s',
                                            '&:hover': {
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    />
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                );

            case 'slider':
                return (
                    <Box sx={{ position: 'relative', height: 500 }}>
                        {gallery[0] && (
                            <Box
                                component="img"
                                src={gallery[0].url}
                                alt={gallery[0].title}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 2
                                }}
                            />
                        )}
                        <Typography
                            variant="caption"
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                right: 16,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                px: 2,
                                py: 1,
                                borderRadius: 1
                            }}
                        >
                            1 / {gallery.length}
                        </Typography>
                    </Box>
                );

            default: // grid
                return (
                    <Grid container spacing={2}>
                        {gallery.map((image, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Box
                                        component="img"
                                        src={image.url}
                                        alt={image.title}
                                        sx={{
                                            width: '100%',
                                            height: 250,
                                            objectFit: 'cover',
                                            borderRadius: 2,
                                            transition: 'transform 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-8px)'
                                            }
                                        }}
                                    />
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                );
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Preview Your Portfolio
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant={viewMode === 'desktop' ? 'contained' : 'outlined'}
                        onClick={() => setViewMode('desktop')}
                        size="small"
                    >
                        Desktop
                    </Button>
                    <Button
                        variant={viewMode === 'mobile' ? 'contained' : 'outlined'}
                        onClick={() => setViewMode('mobile')}
                        size="small"
                    >
                        Mobile
                    </Button>
                </Box>
            </Box>

            <Card
                sx={{
                    maxWidth: viewMode === 'mobile' ? 375 : '100%',
                    mx: 'auto',
                    overflow: 'hidden',
                    transition: 'max-width 0.3s'
                }}
            >
                {/* Preview Content */}
                <Box sx={{ bgcolor: colors.background, color: colors.text, minHeight: 600 }}>
                    {/* Header */}
                    <AppBar
                        position="static"
                        elevation={0}
                        sx={{
                            bgcolor: colors.background,
                            borderBottom: 1,
                            borderColor: 'divider'
                        }}
                    >
                        <Toolbar>
                            <Typography variant="h6" sx={{ flexGrow: 1, color: colors.text }}>
                                {basicInfo.name || 'Your Name'}
                            </Typography>
                            <Button sx={{ color: colors.text }}>Gallery</Button>
                            <Button sx={{ color: colors.text }}>About</Button>
                            <Button sx={{ color: colors.text }}>Contact</Button>
                        </Toolbar>
                    </AppBar>

                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        sx={{
                            bgcolor: colors.background,
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': { color: colors.text }
                        }}
                    >
                        <Tab label="Home" />
                        <Tab label="Gallery" />
                        <Tab label="About" />
                    </Tabs>

                    <Container sx={{ py: 4 }}>
                        {/* Home Tab */}
                        {activeTab === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Hero Section */}
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 700,
                                            mb: 2,
                                            background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}
                                    >
                                        {basicInfo.name || 'Your Name'}
                                    </Typography>
                                    <Typography variant="h5" sx={{ mb: 3, opacity: 0.8 }}>
                                        {content.tagline || basicInfo.tagline || 'Your tagline here'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                                        {basicInfo.photographyStyles?.map((style) => (
                                            <Chip
                                                key={style}
                                                label={style}
                                                sx={{
                                                    bgcolor: colors.primary,
                                                    color: '#fff'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                {/* Bio */}
                                {content.bio && (
                                    <Box sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}>
                                        <Typography variant="body1" sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
                                            {content.bio}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Featured Gallery Preview */}
                                {gallery && gallery.length > 0 && (
                                    <Box>
                                        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                                            Featured Work
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {gallery.slice(0, 3).map((image, index) => (
                                                <Grid item xs={12} md={4} key={index}>
                                                    <Box
                                                        component="img"
                                                        src={image.url}
                                                        alt={image.title}
                                                        sx={{
                                                            width: '100%',
                                                            height: 250,
                                                            objectFit: 'cover',
                                                            borderRadius: 2
                                                        }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}
                            </motion.div>
                        )}

                        {/* Gallery Tab */}
                        {activeTab === 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                                    Gallery
                                </Typography>
                                {renderGallery()}
                            </motion.div>
                        )}

                        {/* About Tab */}
                        {activeTab === 2 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                                    About Me
                                </Typography>

                                {content.aboutSection && (
                                    <Typography variant="body1" sx={{ mb: 4, whiteSpace: 'pre-line' }}>
                                        {content.aboutSection}
                                    </Typography>
                                )}

                                {content.achievements && (
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                                            Achievements
                                        </Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                            {content.achievements}
                                        </Typography>
                                    </Box>
                                )}

                                {content.services && (
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                                            Services
                                        </Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                            {content.services}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Contact Info */}
                                <Box sx={{ mt: 6, p: 3, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 2 }}>
                                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                                        Get In Touch
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {basicInfo.email && (
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Mail size={20} />
                                                    <Typography>{basicInfo.email}</Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {basicInfo.phone && (
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Phone size={20} />
                                                    <Typography>{basicInfo.phone}</Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {basicInfo.location && (
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <MapPin size={20} />
                                                    <Typography>{basicInfo.location}</Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            </motion.div>
                        )}
                    </Container>
                </Box>
            </Card>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    💡 This is a preview of your portfolio. Click "Publish" to make it live!
                </Typography>
            </Box>
        </Box>
    );
};

export default PreviewStep;
