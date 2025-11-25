import React, { useState } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import BasicInfoStep from '../components/BasicInfoStep';
import DesignStep from '../components/DesignStep';
import ContentStep from '../components/ContentStep';
import GalleryStep from '../components/GalleryStep';
import PreviewStep from '../components/PreviewStep';
import { usePortfolioBuilder } from '../context/PortfolioBuilderContext';
import { auth } from '../../../config/firebase';

const steps = ['Basic Info', 'Design', 'Content', 'Gallery', 'Preview'];

const PortfolioBuilderPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [portfolioData, setPortfolioData] = useState({
        basicInfo: {},
        design: {},
        content: {},
        gallery: []
    });
    const [error, setError] = useState(null);
    const { createPortfolio, updatePortfolio, portfolio, loading } = usePortfolioBuilder();

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
                await updatePortfolio(user.uid, portfolioData);
            } else {
                await createPortfolio(user.uid, portfolioData);
            }

            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handlePublish = async () => {
        await handleSave();
        // Additional publish logic here
    };

    const handleFillDemo = () => {
        const demoData = {
            basicInfo: {
                name: 'Alex Morgan',
                email: 'alex.morgan@example.com',
                phone: '+1 (555) 123-4567',
                location: 'San Francisco, CA',
                website: 'https://alexmorgan.photography',
                photographyStyles: ['Wedding', 'Portrait', 'Landscape'],
                experience: '8',
                tagline: 'Capturing Life\'s Beautiful Moments Through My Lens'
            },
            design: {
                layout: 'masonry',
                colorScheme: 'dark',
                mood: 'Elegant',
                customColors: null,
                aiGenerated: false
            },
            content: {
                bio: 'Award-winning photographer specializing in wedding and portrait photography with over 8 years of experience creating timeless memories.',
                aboutSection: 'Hello! I\'m Alex Morgan, a passionate photographer based in San Francisco. My journey into photography began 8 years ago, and since then, I\'ve had the privilege of capturing countless beautiful moments.\n\nI specialize in wedding and portrait photography, but I also love exploring landscape photography during my travels. My approach is to blend artistic vision with authentic emotion, creating images that tell your unique story.\n\nWhen I\'m not behind the camera, you can find me exploring new locations, experimenting with new techniques, or teaching photography workshops to aspiring photographers.',
                tagline: 'Capturing Life\'s Beautiful Moments Through My Lens',
                metaDescription: 'Alex Morgan - Professional Wedding & Portrait Photographer in San Francisco. Award-winning photography services with 8 years of experience.',
                achievements: '• Winner of Best Wedding Photographer 2023\n• Featured in Photography Magazine\n• Over 200 weddings captured\n• Published in National Geographic',
                services: '• Wedding Photography\n• Engagement Sessions\n• Portrait Photography\n• Family Photos\n• Event Coverage\n• Photo Editing & Retouching'
            },
            gallery: [
                {
                    url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
                    fileName: 'demo_wedding_1.jpg',
                    title: 'Sunset Wedding Ceremony',
                    description: 'Beautiful outdoor wedding at golden hour',
                    category: 'Wedding',
                    uploadedAt: new Date().toISOString()
                },
                {
                    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                    fileName: 'demo_portrait_1.jpg',
                    title: 'Natural Light Portrait',
                    description: 'Studio portrait with natural lighting',
                    category: 'Portrait',
                    uploadedAt: new Date().toISOString()
                },
                {
                    url: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                    fileName: 'demo_landscape_1.jpg',
                    title: 'Mountain Vista',
                    description: 'Breathtaking mountain landscape at sunrise',
                    category: 'Landscape',
                    uploadedAt: new Date().toISOString()
                },
                {
                    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
                    fileName: 'demo_wedding_2.jpg',
                    title: 'First Dance',
                    description: 'Romantic first dance moment',
                    category: 'Wedding',
                    uploadedAt: new Date().toISOString()
                },
                {
                    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
                    fileName: 'demo_portrait_2.jpg',
                    title: 'Candid Moment',
                    description: 'Genuine smile captured in the moment',
                    category: 'Portrait',
                    uploadedAt: new Date().toISOString()
                },
                {
                    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                    fileName: 'demo_landscape_2.jpg',
                    title: 'Coastal Sunset',
                    description: 'Dramatic coastal landscape',
                    category: 'Landscape',
                    uploadedAt: new Date().toISOString()
                }
            ]
        };

        setPortfolioData(demoData);
        setError(null);
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <BasicInfoStep
                        data={portfolioData.basicInfo}
                        onUpdate={(data) => handleStepData('basicInfo', data)}
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
