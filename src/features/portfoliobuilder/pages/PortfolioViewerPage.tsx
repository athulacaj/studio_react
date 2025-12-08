import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button, Container, Paper } from '@mui/material';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';
import { usePortfolioBuilder } from '../context/PortfolioBuilderContext';
import PortfolioTemplate from '../components/PortfolioTemplate';
import HtmlTemplateRenderer from '../components/HtmlTemplateRenderer';


const PortfolioViewerPage = () => {
    const { domain } = useParams();
    const { getPortfolioByDomain } = usePortfolioBuilder();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!domain) return;

            setLoading(true);
            try {
                const data = await getPortfolioByDomain(domain);
                window.getData = (removeHtml = true) => {
                    let temp = { ...data }
                    if (removeHtml) {
                        delete temp.design.templateHtml
                    }
                    return temp;
                }
                setPortfolio(data);
            } catch (err) {
                console.error("Failed to load portfolio:", err);
                setError("Portfolio not found or unavailable.");
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, [domain, getPortfolioByDomain]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animated background elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                        top: '10%',
                        left: '10%',
                        animation: 'float 6s ease-in-out infinite',
                        '@keyframes float': {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-30px)' }
                        }
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                        bottom: '10%',
                        right: '10%',
                        animation: 'float 8s ease-in-out infinite',
                    }}
                />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* <CircularProgress
                        size={80}
                        thickness={4}
                        sx={{
                            color: '#6366f1',
                            mb: 3
                        }}
                    /> */}
                    <Typography
                        variant="h5"
                        sx={{
                            color: '#f8fafc',
                            fontWeight: 600,
                            textAlign: 'center',
                            background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Loading Portfolio...
                    </Typography>
                </motion.div>
            </Box>
        );
    }

    if (error || !portfolio) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #450a0a 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animated background elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
                        top: '5%',
                        right: '5%',
                        animation: 'pulse 4s ease-in-out infinite',
                        '@keyframes pulse': {
                            '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
                            '50%': { opacity: 0.8, transform: 'scale(1.05)' }
                        }
                    }}
                />

                <Container maxWidth="sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper
                            elevation={10}
                            sx={{
                                p: 6,
                                borderRadius: 4,
                                background: 'rgba(30, 41, 59, 0.9)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                textAlign: 'center',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                <Box
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto',
                                        mb: 3,
                                        boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
                                    }}
                                >
                                    <AlertCircle size={50} color="#fff" />
                                </Box>
                            </motion.div>

                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    mb: 2,
                                    color: '#f8fafc',
                                    fontSize: { xs: '3rem', md: '4rem' }
                                }}
                            >
                                404
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 600,
                                    mb: 2,
                                    background: 'linear-gradient(45deg, #ef4444 30%, #f59e0b 90%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                Portfolio Not Found
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'rgba(248, 250, 252, 0.7)',
                                    mb: 4,
                                    lineHeight: 1.8
                                }}
                            >
                                {error || "This portfolio doesn't exist or has been removed."}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button
                                    component={Link}
                                    to="/"
                                    variant="contained"
                                    size="large"
                                    startIcon={<Home />}
                                    sx={{
                                        background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #4f46e5 30%, #9333ea 90%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 15px 40px rgba(99, 102, 241, 0.4)',
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Go Home
                                </Button>

                                <Button
                                    component={Link}
                                    to="/private/portfolio-builder"
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderWidth: 2,
                                        borderColor: '#6366f1',
                                        color: '#6366f1',
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderWidth: 2,
                                            borderColor: '#a855f7',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Create Your Own
                                </Button>
                            </Box>
                        </Paper>
                    </motion.div>
                </Container>
            </Box>
        );
    }

    // Check if portfolio uses an HTML template
    if (portfolio.design?.templateHtml && portfolio.design?.templateName) {
        return (
            <HtmlTemplateRenderer
                htmlContent={portfolio.design.templateHtml}
                portfolioData={portfolio}
            />
        );
    }

    // Fallback to default PortfolioTemplate component
    return <PortfolioTemplate portfolioData={portfolio} />;
};

export default PortfolioViewerPage;

