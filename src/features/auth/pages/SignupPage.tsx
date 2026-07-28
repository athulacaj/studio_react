import React from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Link as MuiLink
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { Link } from 'react-router-dom';

export default function SignupPage() {
    const handleGoogleSignup = () => {
        window.location.href = import.meta.env.VITE_GOOGLE_LOGIN_URL || '';
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: 2
                    }}
                >
                    <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                        Sign Up
                    </Typography>

                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleSignup}
                        sx={{ mt: 1, mb: 2, py: 1.5 }}
                    >
                        Sign Up with Google
                    </Button>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography variant="body2">
                            Already have an account?{' '}
                            <MuiLink component={Link} to="/login" variant="body2">
                                Sign In
                            </MuiLink>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
