import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Button, Alert, Grid, Chip, Stack } from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    CloudUpload as UploadIcon,
    AutoAwesome as SparklesIcon,
    ArrowForward as ArrowForwardIcon,
    CheckCircle as CheckIcon,
    Lock as LockIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import { usePortfolioContext } from '../context/portfolioGlobalContext';
import { WebsiteTemplate } from '../api/WebsiteService';
import { usePortfolioStore } from '../store/portfolioStore';
import TemplateSelectionDialog from './TemplateSelectionDialog';

interface UploadTemplateStepProps {
    error: string | null;
    onNavigateBack: () => void;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectTemplate?: (template: WebsiteTemplate) => void;
}

export const UploadTemplateStep: React.FC<UploadTemplateStepProps> = ({
    error,
    onNavigateBack,
    onFileUpload,
    onSelectTemplate,
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const { templatesDataList }: { templatesDataList: WebsiteTemplate[] } = usePortfolioStore();
    const { managePortfolioController } = usePortfolioContext();

    const handleTemplateSelect = (template: WebsiteTemplate) => {
        setIsDialogOpen(false);
        if (onSelectTemplate) {
            onSelectTemplate(template);
        } else if (managePortfolioController?.handleSelectTemplate) {
            managePortfolioController.handleSelectTemplate(template);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const syntheticEvent = {
                target: { files: e.dataTransfer.files }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onFileUpload(syntheticEvent);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#030912',
                backgroundImage: `
                    radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.18) 0%, transparent 60%),
                    radial-gradient(circle at 85% 75%, rgba(56, 189, 248, 0.08) 0%, transparent 50%),
                    radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 100% 100%, 28px 28px',
                py: { xs: 4, md: 6 },
                px: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            <Container maxWidth="xl" sx={{ my: 'auto' }}>
                {/* Header Navigation & Title */}
                <Box sx={{ mb: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={onNavigateBack}
                            sx={{
                                color: '#94A3B8',
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: 3,
                                px: 2.5,
                                py: 1,
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                backdropFilter: 'blur(8px)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    color: '#FFF',
                                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    transform: 'translateX(-2px)',
                                },
                            }}
                        >
                            Back to Dashboard
                        </Button>

                        <Chip
                            icon={<SparklesIcon sx={{ fontSize: '16px !important', color: '#C084FC !important' }} />}
                            label="STEP 1 OF 2 • SETUP METHOD"
                            sx={{
                                bgcolor: 'rgba(124, 58, 237, 0.12)',
                                color: '#C084FC',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                letterSpacing: '0.05em',
                                px: 1,
                            }}
                        />
                    </Box>

                    <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto' }}>
                        <Typography
                            variant="h3"
                            sx={{
                                color: '#FFF',
                                fontWeight: 800,
                                mb: 1.5,
                                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                letterSpacing: '-0.03em',
                                background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Choose Your Portfolio Starting Point
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#94A3B8', fontSize: { xs: '0.95rem', sm: '1.05rem' }, lineHeight: 1.6 }}>
                            Pick a pre-designed responsive template from our curated library or upload your existing HTML code.
                        </Typography>
                    </Box>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 4,
                            bgcolor: 'rgba(211, 47, 47, 0.12)',
                            color: '#ffb4ab',
                            borderRadius: 3,
                            border: '1px solid rgba(211, 47, 47, 0.3)',
                            backdropFilter: 'blur(10px)',
                            maxWidth: 800,
                            mx: 'auto',
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Main Horizontal Side-by-Side Cards Grid */}
                <Grid container spacing={{ xs: 3, lg: 4 }} alignItems="stretch">
                    {/* Option 1: Browse Templates Card */}
                    <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex' }}>
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                p: { xs: 3, sm: 4 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                borderRadius: 5,
                                bgcolor: 'rgba(15, 23, 42, 0.65)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(168, 85, 247, 0.25)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                                '&:hover': {
                                    borderColor: 'rgba(192, 132, 252, 0.6)',
                                    transform: 'translateY(-6px)',
                                    boxShadow: '0 25px 50px rgba(124, 58, 237, 0.22)',
                                },
                            }}
                        >
                            {/* Accent Glow Top Right */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -60,
                                    right: -60,
                                    width: 180,
                                    height: 180,
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
                                    pointerEvents: 'none',
                                }}
                            />

                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                {/* Header badge + title */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 3.5,
                                            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.5) 0%, rgba(168, 85, 247, 0.3) 100%)',
                                            border: '1px solid rgba(192, 132, 252, 0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 8px 16px rgba(124, 58, 237, 0.25)',
                                        }}
                                    >
                                        <SparklesIcon sx={{ color: '#C084FC', fontSize: 30 }} />
                                    </Box>
                                    <Chip
                                        icon={<StarIcon sx={{ fontSize: '14px !important', color: '#F59E0B !important' }} />}
                                        label="RECOMMENDED"
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(245, 158, 11, 0.12)',
                                            color: '#FBBF24',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            letterSpacing: '0.04em',
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                                    <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 700, fontSize: { xs: '1.4rem', sm: '1.65rem' } }}>
                                        Browse Template Library
                                    </Typography>
                                    <Chip
                                        label={`${templatesDataList.length} Ready Templates`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(168, 85, 247, 0.18)',
                                            color: '#E9D5FF',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            border: '1px solid rgba(168, 85, 247, 0.3)',
                                        }}
                                    />
                                </Box>

                                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, lineHeight: 1.6, fontSize: '0.925rem' }}>
                                    Choose from crafted responsive layouts with built-in dark/light modes, image galleries, and editable content structures.
                                </Typography>

                                {/* Visual Browser Window Mockup */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        mb: 3,
                                        borderRadius: 3,
                                        bgcolor: '#090D16',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Browser Top Navigation Bar */}
                                    <Box
                                        sx={{
                                            px: 2,
                                            py: 1.2,
                                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                        }}
                                    >
                                        {/* macOS Window Controls */}
                                        <Box sx={{ display: 'flex', gap: 0.8 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#27C93F' }} />
                                        </Box>
                                        {/* Browser Address Bar */}
                                        <Box
                                            sx={{
                                                flexGrow: 1,
                                                bgcolor: 'rgba(0, 0, 0, 0.4)',
                                                borderRadius: 1.5,
                                                px: 1.5,
                                                py: 0.4,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                            }}
                                        >
                                            <LockIcon sx={{ fontSize: 12, color: '#10B981' }} />
                                            <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace', fontSize: '0.725rem' }}>
                                                https://studio.portfolio/templates
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Browser Inner Visual Showcase Cards */}
                                    <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                                        {[
                                            { title: 'Modern Dark', tag: 'Minimal', color: 'linear-gradient(135deg, #1E1B4B 0%, #311E63 100%)' },
                                            { title: 'Executive', tag: 'Clean', color: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' },
                                            { title: 'Creative', tag: 'Vibrant', color: 'linear-gradient(135deg, #311B92 0%, #4A148C 100%)' },
                                        ].map((item, idx) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    borderRadius: 2,
                                                    p: 1.5,
                                                    background: item.color,
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    minHeight: 84,
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        borderColor: '#C084FC',
                                                        transform: 'scale(1.03)',
                                                    },
                                                }}
                                                onClick={() => setIsDialogOpen(true)}
                                            >
                                                <Box sx={{ width: 20, height: 4, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.4)', mb: 1 }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#FFF', fontWeight: 600, display: 'block', fontSize: '0.725rem', lineHeight: 1.2 }}>
                                                        {item.title}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#A78BFA', fontSize: '0.65rem' }}>
                                                        {item.tag}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>

                                {/* Feature Highlights List */}
                                <Stack spacing={1.2} sx={{ mb: 4 }}>
                                    {[
                                        'Instant 1-click preview & customization setup',
                                        'Fully responsive layout for mobile, tablet & desktop',
                                        'Integrated state management & portfolio schema',
                                    ].map((text, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                            <CheckIcon sx={{ color: '#C084FC', fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.875rem' }}>
                                                {text}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<SparklesIcon />}
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => setIsDialogOpen(true)}
                                sx={{
                                    borderRadius: 3.5,
                                    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                                    py: 1.8,
                                    px: 3,
                                    fontWeight: 700,
                                    fontSize: '0.975rem',
                                    textTransform: 'none',
                                    letterSpacing: '0.01em',
                                    boxShadow: '0 6px 24px rgba(124, 58, 237, 0.4)',
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)',
                                        boxShadow: '0 8px 30px rgba(124, 58, 237, 0.55)',
                                    },
                                }}
                            >
                                Open Template Library ({templatesDataList.length})
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Option 2: Upload Custom File Card */}
                    <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex' }}>
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                p: { xs: 3, sm: 4 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                borderRadius: 5,
                                bgcolor: 'rgba(15, 23, 42, 0.5)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                                '&:hover': {
                                    borderColor: 'rgba(255, 255, 255, 0.25)',
                                    transform: 'translateY(-6px)',
                                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
                                },
                            }}
                        >
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                {/* Header Icon & Tag */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 3.5,
                                            bgcolor: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <UploadIcon sx={{ color: '#38BDF8', fontSize: 30 }} />
                                    </Box>
                                    <Chip
                                        label="ADVANCED / CUSTOM"
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(56, 189, 248, 0.1)',
                                            color: '#38BDF8',
                                            border: '1px solid rgba(56, 189, 248, 0.25)',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            letterSpacing: '0.04em',
                                        }}
                                    />
                                </Box>

                                <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 700, mb: 1, fontSize: { xs: '1.4rem', sm: '1.65rem' } }}>
                                    Upload Custom HTML File
                                </Typography>

                                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, lineHeight: 1.6, fontSize: '0.925rem' }}>
                                    Import your customized template file. We automatically parse embedded <Box component="code" sx={{ color: '#38BDF8', bgcolor: 'rgba(56, 189, 248, 0.1)', px: 0.8, py: 0.2, borderRadius: 1 }}>portfolioData</Box> configurations.
                                </Typography>

                                {/* Drag and Drop Visual Zone */}
                                <Paper
                                    elevation={0}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    component="label"
                                    sx={{
                                        mb: 3,
                                        p: 3,
                                        borderRadius: 3,
                                        bgcolor: isDragOver ? 'rgba(56, 189, 248, 0.08)' : 'rgba(9, 13, 22, 0.7)',
                                        border: `2px dashed ${isDragOver ? '#38BDF8' : 'rgba(255, 255, 255, 0.12)'}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                        minHeight: 140,
                                        '&:hover': {
                                            borderColor: '#38BDF8',
                                            bgcolor: 'rgba(56, 189, 248, 0.04)',
                                        },
                                    }}
                                >
                                    <input
                                        type="file"
                                        hidden
                                        accept=".html,text/html"
                                        onChange={onFileUpload}
                                    />
                                    <UploadIcon sx={{ color: isDragOver ? '#38BDF8' : '#64748B', fontSize: 38, mb: 1, transition: 'color 0.2s ease' }} />
                                    <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600, mb: 0.5 }}>
                                        Drop your .html file here, or <Box component="span" sx={{ color: '#38BDF8', textDecoration: 'underline' }}>browse</Box>
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                                        Supports HTML5 files up to 10MB
                                    </Typography>
                                </Paper>

                                {/* Feature Highlights List */}
                                <Stack spacing={1.2} sx={{ mb: 4 }}>
                                    {[
                                        'Preserves custom CSS styling & Vanilla JavaScript logic',
                                        'Extracts schema parameters for real-time live editing',
                                        'Zero framework build dependencies required',
                                    ].map((text, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                            <CheckIcon sx={{ color: '#38BDF8', fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.875rem' }}>
                                                {text}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>

                            <Button
                                variant="outlined"
                                component="label"
                                size="large"
                                startIcon={<UploadIcon />}
                                sx={{
                                    borderRadius: 3.5,
                                    borderColor: 'rgba(56, 189, 248, 0.4)',
                                    color: '#E2E8F0',
                                    py: 1.8,
                                    px: 3,
                                    fontWeight: 700,
                                    fontSize: '0.975rem',
                                    textTransform: 'none',
                                    letterSpacing: '0.01em',
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        borderColor: '#38BDF8',
                                        bgcolor: 'rgba(56, 189, 248, 0.1)',
                                        color: '#FFF',
                                        boxShadow: '0 6px 20px rgba(56, 189, 248, 0.2)',
                                    },
                                }}
                            >
                                Select & Upload HTML File
                                <input
                                    type="file"
                                    hidden
                                    accept=".html,text/html"
                                    onChange={onFileUpload}
                                />
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Template Selection Dialog Modal */}
            <TemplateSelectionDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                templates={templatesDataList}
                onSelectTemplate={handleTemplateSelect}
            />
        </Box>
    );
};

export default UploadTemplateStep;

