import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Link as MuiLink,
    TextField,
    Divider,
    Alert
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    const allowBaseLogin = location.search.includes("baseLogin=true");
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("login page")
    }, [])
    
    const handleGoogleLogin = () => {
        window.location.href = import.meta.env.VITE_GOOGLE_LOGIN_URL || '';
    };

    const handleBaseLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await login({ email, password });
            if (res.success && res.data) {
                setUser(res.data);
                navigate('/');
            } else {
                setError('Login failed');
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
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

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {allowBaseLogin && (
                        <Box component="form" onSubmit={handleBaseLogin} sx={{ width: '100%', mb: 2 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                            
                            <Divider sx={{ my: 2 }}>OR</Divider>
                        </Box>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                        sx={{ mt: 1, mb: 2, py: 1.5 }}
                        color={allowBaseLogin ? "secondary" : "primary"}
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
