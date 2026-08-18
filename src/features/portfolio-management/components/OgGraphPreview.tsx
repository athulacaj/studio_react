import React from 'react';
import { Box, Typography } from '@mui/material';
import { usePortfolioStore } from '../store/portfolioStore';

const OgGraphPreview: React.FC = () => {
    const { ogData } = usePortfolioStore();

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
            p: 4,
            overflowY: 'auto'
        }}>
            <Typography variant="h5" sx={{ color: '#fff', mb: 4, fontWeight: 600 }}>
                Social Media Preview
            </Typography>

            {/* WhatsApp Link Preview Mockup (Dark Mode) */}
            <Box sx={{
                width: '100%',
                maxWidth: 400,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                overflow: 'hidden',
                bgcolor: '#202C33', // WhatsApp dark mode bg
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                fontFamily: 'Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif',
            }}>
                {/* Image */}
                <Box sx={{
                    width: '100%',
                    height: 200,
                    bgcolor: '#111B21', // Darker bg for image placeholder
                    backgroundImage: ogData.image ? `url(${ogData.image})` : 'none',
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
                <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{
                        color: '#E9EDEF',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {ogData.title || 'Your Website Title'}
                    </Typography>
                    
                    <Typography sx={{
                        color: '#8696A0',
                        fontSize: '0.85rem',
                        lineHeight: 1.3,
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
            <Typography variant="body2" sx={{ color: '#64748B', mt: 4, textAlign: 'center', maxWidth: 400 }}>
                This is how your portfolio link might appear when shared on platforms like WhatsApp or Facebook.
            </Typography>
        </Box>
    );
};

export default OgGraphPreview;
