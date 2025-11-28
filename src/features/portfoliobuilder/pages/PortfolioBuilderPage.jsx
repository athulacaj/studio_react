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

// ==================== Constants ====================
const STEPS = ['Basic Info', 'Design', 'Content', 'Gallery', 'Preview'];

const INITIAL_PORTFOLIO_DATA = {
    basicInfo: {},
    design: {},
    content: {},
    gallery: []
};

// ==================== Subcomponents ====================

/**
 * Success screen shown after portfolio is published
 */
const PublishSuccessScreen = ({ portfolioData, onContinueEditing }) => (
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
                        onClick={onContinueEditing}
                    >
                        Continue Editing
                    </Button>
                </Box>
            </motion.div>
        </Paper>
    </Box>
);

/**
 * Header with title and demo data button
 */
const PageHeader = ({ onFillDemo }) => (
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
            onClick={onFillDemo}
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
);

/**
 * Navigation buttons (Back, Save Draft, Next/Publish)
 */
const NavigationButtons = ({
    activeStep,
    totalSteps,
    isDomainValid,
    loading,
    onBack,
    onSave,
    onNext,
    onPublish
}) => {
    const isFirstStep = activeStep === 0;
    const isLastStep = activeStep === totalSteps - 1;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
                disabled={isFirstStep}
                onClick={onBack}
                variant="outlined"
                sx={{ minWidth: 100 }}
            >
                Back
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    onClick={onSave}
                    variant="outlined"
                    disabled={loading}
                >
                    Save Draft
                </Button>

                {isLastStep ? (
                    <Button
                        onClick={onPublish}
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
                        onClick={onNext}
                        variant="contained"
                        sx={{ minWidth: 100 }}
                        disabled={isFirstStep && !isDomainValid}
                    >
                        Next
                    </Button>
                )}
            </Box>
        </Box>
    );
};

// ==================== Custom Hook ====================

/**
 * Hook to manage portfolio data synchronization with Firebase
 */
const usePortfolioSync = (portfolio, setPortfolioData, setIsDomainValid) => {
    useEffect(() => {
        if (portfolio) {
            setPortfolioData(prev => ({
                ...prev,
                basicInfo: {
                    ...portfolio.basicInfo,
                    domain: portfolio.basicInfo?.domain || prev.basicInfo.domain
                },
                design: portfolio.design || {},
                content: portfolio.content || {},
                gallery: portfolio.gallery || []
            }));

            // Mark domain as valid if portfolio already has one
            if (portfolio.basicInfo?.domain) {
                setIsDomainValid(true);
            }
        }
    }, [portfolio, setPortfolioData, setIsDomainValid]);
};

/**
 * Hook to load portfolio on auth state change
 */
const useAuthAndLoadPortfolio = (loadPortfolio) => {
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                loadPortfolio(user.uid);
            }
        });
        return () => unsubscribe();
    }, [loadPortfolio]);
};

// ==================== Main Component ====================

const PortfolioBuilderPage = () => {
    // State
    const [activeStep, setActiveStep] = useState(0);
    const [portfolioData, setPortfolioData] = useState(INITIAL_PORTFOLIO_DATA);
    const [isDomainValid, setIsDomainValid] = useState(false);
    const [error, setError] = useState(null);
    const [isPublished, setIsPublished] = useState(false);

    // Context
    const {
        createPortfolio,
        updatePortfolio,
        portfolio,
        loading,
        loadPortfolio,
        togglePublish
    } = usePortfolioBuilder();

    // Custom hooks for side effects
    useAuthAndLoadPortfolio(loadPortfolio);
    usePortfolioSync(portfolio, setPortfolioData, setIsDomainValid);

    // ==================== Event Handlers ====================

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
                return false;
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
        setIsDomainValid(true);
        setError(null);
    };

    const handleContinueEditing = () => {
        setIsPublished(false);
    };

    // ==================== Step Content Renderer ====================

    const getStepContent = (step) => {
        const stepComponents = {
            0: (
                <BasicInfoStep
                    data={portfolioData.basicInfo}
                    onUpdate={(data) => handleStepData('basicInfo', data)}
                    currentDomain={portfolio?.basicInfo?.domain}
                    onValidityChange={setIsDomainValid}
                />
            ),
            1: (
                <DesignStep
                    data={portfolioData.design}
                    onUpdate={(data) => handleStepData('design', data)}
                />
            ),
            2: (
                <ContentStep
                    data={portfolioData.content}
                    basicInfo={portfolioData.basicInfo}
                    onUpdate={(data) => handleStepData('content', data)}
                />
            ),
            3: (
                <GalleryStep
                    data={portfolioData.gallery}
                    onUpdate={(data) => handleStepData('gallery', data)}
                />
            ),
            4: (
                <PreviewStep
                    portfolioData={portfolioData}
                />
            )
        };

        return stepComponents[step] || 'Unknown step';
    };

    // ==================== Render ====================

    // Show success screen after publishing
    if (isPublished) {
        return (
            <PublishSuccessScreen
                portfolioData={portfolioData}
                onContinueEditing={handleContinueEditing}
            />
        );
    }

    // Main builder interface
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
                    <PageHeader onFillDemo={handleFillDemo} />

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
                            {STEPS.map((label) => (
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

                        <NavigationButtons
                            activeStep={activeStep}
                            totalSteps={STEPS.length}
                            isDomainValid={isDomainValid}
                            loading={loading}
                            onBack={handleBack}
                            onSave={handleSave}
                            onNext={handleNext}
                            onPublish={handlePublish}
                        />
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default PortfolioBuilderPage;
