import React from 'react';
import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { usePortfolioStore } from '../store/portfolioStore';

const OgGraphPreview: React.FC = () => {
    const theme = useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { ogData, setMobileView } = usePortfolioStore();

    // Utility to get domain from url
    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname;
        } catch {
            return url || 'yourwebsite.com';
        }
    };

    return (
        <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#030912',
            p: { xs: 2.5, sm: 4 },
            position: 'relative',
            height: '100%',
            overflowY: 'auto'
        }}>
            <Typography variant="h5" sx={{ color: '#fff', mb: { xs: 2.5, sm: 4 }, fontWeight: 600, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                Social Media Preview
            </Typography>

            {/* WhatsApp Link Preview Mockup (Dark Mode) */}
            <Box sx={{
                width: '100%',
                maxWidth: 400,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                overflow: 'hidden',
                bgcolor: '#202C33', // WhatsApp dark mode bg
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                fontFamily: 'Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif',
            }}>
                {/* Image */}
                <Box sx={{
                    width: '100%',
                    height: { xs: 180, sm: 210 },
                    bgcolor: '#111B21',
                    backgroundImage: ogData.image ? `url('${ogData.image}')` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {!ogData.image && (
                        <Typography variant="body2" sx={{ color: '#8696A0' }}>
                            No image provided
                        </Typography>
                    )}
                </Box>

                {/* Text Content */}
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{
                        color: '#E9EDEF',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        lineHeight: 1.25,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {ogData.title || 'Your Website Title'}
                    </Typography>
                    
                    <Typography sx={{
                        color: '#8696A0',
                        fontSize: '0.825rem',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {ogData.description || 'Provide a compelling description for your website that will appear in social media feeds.'}
                    </Typography>
                    
                    <Typography sx={{
                        color: '#8696A0',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        textTransform: 'lowercase'
                    }}>
                        {getDomain(ogData.url)}
                    </Typography>
                </Box>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#64748B', mt: { xs: 2.5, sm: 4 }, textAlign: 'center', maxWidth: 380, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                This is how your portfolio link might appear when shared on platforms like WhatsApp or Facebook.
            </Typography>

            {/* Mobile Quick Switch Floating Action Pill */}
            {isMobileScreen && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 30,
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setMobileView('editor')}
                        sx={{
                            borderRadius: '50px',
                            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4), 0 2px 6px rgba(0,0,0,0.3)',
                            color: '#FFF',
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            letterSpacing: '0.02em',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                                transform: 'translateY(-2px)',
                            }
                        }}
                    >
                        Edit OG Settings
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default OgGraphPreview;
