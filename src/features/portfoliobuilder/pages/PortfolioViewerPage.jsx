import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { usePortfolioBuilder } from '../context/PortfolioBuilderContext';
import PortfolioTemplate from '../components/PortfolioTemplate';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#0f172a' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !portfolio) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: '#0f172a',
                color: '#f8fafc',
                gap: 2
            }}>
                <Typography variant="h4" fontWeight="bold">
                    404
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    {error || "Portfolio not found"}
                </Typography>
                <Button
                    component={Link}
                    to="/"
                    variant="outlined"
                    startIcon={<Home />}
                    sx={{ mt: 2 }}
                >
                    Go Home
                </Button>
            </Box>
        );
    }

    return <PortfolioTemplate portfolioData={portfolio} />;
};

export default PortfolioViewerPage;
