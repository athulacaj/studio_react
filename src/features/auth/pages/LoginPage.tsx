import React, { useEffect } from 'react';
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

export default function LoginPage() {
    useEffect(() => {
        console.log("login page")
    }, [])
    const handleGoogleLogin = () => {
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
                        Sign In
                    </Typography>

                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                        sx={{ mt: 1, mb: 2, py: 1.5 }}
                    >
                        Sign In with Google
                    </Button>

                    {/* <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography variant="body2">
                            Don't have an account?{' '}
                            <MuiLink component={Link} to="/signup" variant="body2">
                                Sign Up
                            </MuiLink>
                        </Typography>
                    </Box> */}
                </Paper>
            </Box>
        </Container>
    );
}
