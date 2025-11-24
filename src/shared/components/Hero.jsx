import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

const Hero = () => {
    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                bgcolor: '#0f172a',
                py: { xs: 12, sm: 16 }
            }}
        >
            {/* Background Gradient */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.2,
                    filter: 'blur(4px)'
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent, #0f172a)'
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                        fontSize: { xs: '3rem', sm: '4.5rem' },
                        fontWeight: 800,
                        letterSpacing: '-0.025em',
                        color: 'white',
                        mb: 3,
                        textShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        fontFamily: 'Inter, sans-serif'
                    }}
                >
                    Capture <Box component="span" sx={{
                        background: 'linear-gradient(to right, #818cf8, #22d3ee)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Moments</Box>, <br />
                    Create <Box component="span" sx={{
                        background: 'linear-gradient(to right, #c084fc, #f472b6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Memories</Box>
                </Typography>

                <Typography
                    variant="h5"
                    sx={{
                        mt: 3,
                        fontSize: '1.125rem',
                        lineHeight: 1.75,
                        color: '#d1d5db',
                        maxWidth: '42rem',
                        mx: 'auto',
                        mb: 5,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 300
                    }}
                >
                    Your personal studio for organizing, proofing, and sharing your most cherished photos.
                    Experience a new way to interact with your gallery.
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            bgcolor: '#4f46e5',
                            '&:hover': { bgcolor: '#4338ca', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.5)' },
                            color: 'white',
                            fontWeight: 600,
                            py: 1.5,
                            px: 4,
                            borderRadius: '9999px',
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            background: 'linear-gradient(to right, #6366f1, #a855f7)',
                            transition: 'all 0.3s',
                            transform: 'translateY(0)',
                            '&:hover': {
                                transform: 'translateY(-4px)'
                            }
                        }}
                    >
                        Get Started
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        sx={{
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.5)',
                            fontWeight: 600,
                            py: 1.5,
                            px: 4,
                            borderRadius: '9999px',
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            transition: 'all 0.3s',
                            '&:hover': {
                                borderColor: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        Learn More
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default Hero;
