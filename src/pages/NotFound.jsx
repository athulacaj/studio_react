import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
            <Typography variant="h1" component="h1" sx={{ fontSize: '8rem', fontWeight: 'bold', background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 2 }}>
                404
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </Typography>
            <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/')}
                startIcon={<HomeIcon />}
                sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 50,
                    background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                    boxShadow: '0 3px 5px 2px rgba(168, 85, 247, .3)',
                }}
            >
                Go to Home
            </Button>
        </Container>
    );
};

export default NotFound;
