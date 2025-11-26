import React, { useState, useEffect } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Container,
    Paper,
    Alert
} from '@mui/material';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import BasicInfoStep from '../components/BasicInfoStep';
import DesignStep from '../components/DesignStep';
import ContentStep from '../components/ContentStep';
import GalleryStep from '../components/GalleryStep';
import PreviewStep from '../components/PreviewStep';
import { usePortfolioBuilder } from '../context/PortfolioBuilderContext';
import { auth } from '../../../config/firebase';
import { getDemoData } from '../utils/common_fuctions';

const steps = ['Basic Info', 'Design', 'Content', 'Gallery', 'Preview'];

const PortfolioBuilderPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [portfolioData, setPortfolioData] = useState({
        basicInfo: {},
        design: {},
        content: {},
        gallery: []
    });
    const [isDomainValid, setIsDomainValid] = useState(false);
    const [error, setError] = useState(null);
    const [isPublished, setIsPublished] = useState(false);
    const { createPortfolio, updatePortfolio, portfolio, loading, loadPortfolio, togglePublish } = usePortfolioBuilder();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                loadPortfolio(user.uid);
            }
        });
        return () => unsubscribe();
    }, [loadPortfolio]);

    // Update local state when portfolio is loaded
    useEffect(() => {
        if (portfolio) {
            setPortfolioData(prev => ({
                ...prev,
                basicInfo: {
                    ...portfolio.basicInfo,
                    // If portfolio exists, use its domain. If not, use what's in local state or empty.
                    domain: portfolio.basicInfo?.domain || prev.basicInfo.domain
                },
                design: portfolio.design || {},
                content: portfolio.content || {},
                gallery: portfolio.gallery || []
            }));
            // If loading existing portfolio and it has a domain, it's valid
            if (portfolio.basicInfo?.domain) {
                setIsDomainValid(true);
            }
        }
    }, [portfolio]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStepData = (stepName, data) => {
        setPortfolioData(prev => ({
            ...prev,
            [stepName]: data
        }));
    };

    const handleSave = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                setError('Please sign in to save your portfolio');
                return;
            }

            if (portfolio) {
                await updatePortfolio(portfolio.id, portfolioData);
            } else {
                await createPortfolio(user.uid, portfolioData);
            }

            setError(null);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const handlePublish = async () => {
        const saved = await handleSave();
        if (!saved) return;

        try {
            const result = await togglePublish(portfolio.id, true);
            if (result.success) {
                setIsPublished(true);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFillDemo = () => {
        const demoData = getDemoData();

        setPortfolioData(demoData);
        // For demo data, we assume domain is valid (it's random)
        setIsDomainValid(true);
        setError(null);
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <BasicInfoStep
                        data={portfolioData.basicInfo}
                        onUpdate={(data) => handleStepData('basicInfo', data)}
                        currentDomain={portfolio?.basicInfo?.domain}
                        onValidityChange={setIsDomainValid}
                    />
                );
            case 1:
                return (
                    <DesignStep
                        data={portfolioData.design}
                        basicInfo={portfolioData.basicInfo}
                        onUpdate={(data) => handleStepData('design', data)}
                    />
                );
            case 2:
                return (
                    <ContentStep
                        data={portfolioData.content}
                        basicInfo={portfolioData.basicInfo}
                        onUpdate={(data) => handleStepData('content', data)}
                    />
                );
            case 3:
                return (
                    <GalleryStep
                        data={portfolioData.gallery}
                        onUpdate={(data) => handleStepData('gallery', data)}
                    />
                );
            case 4:
                return (
                    <PreviewStep
                        portfolioData={portfolioData}
                    />
                );
            default:
                return 'Unknown step';
        }
    };

    if (isPublished) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 6,
                        borderRadius: 4,
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(10px)',
                        maxWidth: 600,
                        width: '100%',
                        textAlign: 'center'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography variant="h1" sx={{ fontSize: 60, mb: 2 }}>
                            🎉
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>
                            Portfolio Published!
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                            Your portfolio is now live and accessible to the world.
                        </Typography>

                        <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, mb: 4 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                                Your Portfolio URL:
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#6366f1', wordBreak: 'break-all' }}>
                                {window.location.origin}/portfolio/{portfolioData.basicInfo.domain}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                href={`/portfolio/${portfolioData.basicInfo.domain}`}
                                target="_blank"
                                sx={{
                                    background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                                }}
                            >
                                Visit Portfolio
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setIsPublished(false)}
                            >
                                Continue Editing
                            </Button>
                        </Box>
                    </motion.div>
                </Paper>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                py: 10
            }}
        >
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Portfolio Builder
                        </Typography>

                        <Button
                            variant="outlined"
                            onClick={handleFillDemo}
                            sx={{
                                borderColor: '#10b981',
                                color: '#10b981',
                                '&:hover': {
                                    borderColor: '#059669',
                                    background: 'rgba(16, 185, 129, 0.1)'
                                }
                            }}
                        >
                            🎨 Fill Demo Data
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            background: 'rgba(30, 41, 59, 0.8)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel
                                        sx={{
                                            '& .MuiStepLabel-label': {
                                                color: 'text.secondary',
                                            },
                                            '& .MuiStepLabel-label.Mui-active': {
                                                color: 'primary.main',
                                            },
                                            '& .MuiStepLabel-label.Mui-completed': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    >
                                        {label}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box sx={{ minHeight: 400 }}>
                                    {getStepContent(activeStep)}
                                </Box>
                            </motion.div>
                        </AnimatePresence>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                variant="outlined"
                                sx={{ minWidth: 100 }}
                            >
                                Back
                            </Button>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    onClick={handleSave}
                                    variant="outlined"
                                    disabled={loading}
                                >
                                    Save Draft
                                </Button>

                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        onClick={handlePublish}
                                        variant="contained"
                                        disabled={loading}
                                        sx={{
                                            minWidth: 120,
                                            background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                                        }}
                                    >
                                        Publish
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        variant="contained"
                                        sx={{ minWidth: 100 }}
                                        disabled={activeStep === 0 && !isDomainValid}
                                    >
                                        Next
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default PortfolioBuilderPage;
