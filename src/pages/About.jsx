import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const About = () => {
    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)' }}>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    About Studio React
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.secondary', mb: 4 }}>
                    Your premium photo management solution.
                </Typography>
                <Box sx={{ mt: 4 }}>
                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                        Studio React is designed to help you organize, view, and manage your photo collections with style and ease.
                        Built with the latest web technologies including React, Material-UI, and Vite, it offers a seamless and responsive experience across all devices.
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2, opacity: 0.7 }}>
                        Version 1.0.0
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default About;
