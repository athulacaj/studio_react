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
    Alert,
    IconButton,
    InputAdornment
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
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
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

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
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0B0F19 0%, #1A1A2E 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E")',
                    pointerEvents: 'none',
                }
            }}
        >
            <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, sm: 5 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: 4,
                        background: 'rgba(20, 25, 40, 0.65)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(138, 43, 226, 0.15)'
                    }}
                >
                    <Typography component="h1" variant="h4" sx={{ 
                        mb: 4, 
                        fontWeight: 800, 
                        color: '#fff', 
                        letterSpacing: '-0.5px',
                        background: 'linear-gradient(to right, #fff, #a78bfa)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Welcome Back
                    </Typography>

                    {error && (
                        <Alert 
                            severity="error" 
                            variant="filled"
                            sx={{ 
                                width: '100%', 
                                mb: 3, 
                                borderRadius: 2,
                                backgroundColor: 'rgba(211, 47, 47, 0.2)',
                                color: '#ffb4ab',
                                border: '1px solid rgba(211, 47, 47, 0.3)'
                            }}
                        >
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
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        color: '#fff',
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: 2,
                                        '& input:-webkit-autofill': {
                                            WebkitBoxShadow: '0 0 0 1000px #1E2336 inset !important',
                                            WebkitTextFillColor: '#fff !important',
                                            transition: 'background-color 5000s ease-in-out 0s',
                                        },
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#a78bfa',
                                            borderWidth: '2px',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        '&.Mui-focused': {
                                            color: '#a78bfa',
                                        }
                                    }
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                                sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        color: '#fff',
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: 2,
                                        '& input:-webkit-autofill': {
                                            WebkitBoxShadow: '0 0 0 1000px #1E2336 inset !important',
                                            WebkitTextFillColor: '#fff !important',
                                            transition: 'background-color 5000s ease-in-out 0s',
                                        },
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#a78bfa',
                                            borderWidth: '2px',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        '&.Mui-focused': {
                                            color: '#a78bfa',
                                        }
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{ 
                                    py: 1.5,
                                    mb: 3,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    background: 'linear-gradient(45deg, #7e22ce 0%, #a855f7 100%)',
                                    boxShadow: '0 4px 14px 0 rgba(168, 85, 247, 0.39)',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #6b21a8 0%, #9333ea 100%)',
                                        boxShadow: '0 6px 20px rgba(168, 85, 247, 0.5)',
                                        transform: 'translateY(-1px)'
                                    },
                                    '&:disabled': {
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.3)'
                                    }
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                            
                            <Divider sx={{ 
                                my: 3, 
                                '&::before, &::after': { 
                                    borderColor: 'rgba(255, 255, 255, 0.1)' 
                                },
                                '& .MuiDivider-wrapper': {
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }
                            }}>
                                OR
                            </Divider>
                        </Box>
                    )}

                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon sx={{ color: '#fff' }} />}
                        onClick={handleGoogleLogin}
                        sx={{ 
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: '1rem',
                            textTransform: 'none',
                            color: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                                background: 'rgba(255, 255, 255, 0.08)',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        Continue with Google
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}
