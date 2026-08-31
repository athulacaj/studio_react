import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Button, Alert, Grid, Chip, Stack } from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    CloudUpload as UploadIcon,
    AutoAwesome as SparklesIcon,
    ArrowForward as ArrowForwardIcon,
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
                <Box sx={{ mb: { xs: 3, sm: 5 } }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column-reverse', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2,
                        mb: 3
                    }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={onNavigateBack}
                            sx={{
                                color: '#94A3B8',
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: 1.5,
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
                                borderRadius: 1,
                                px: 1,
                            }}
                        />
                    </Box>
                </Box>


                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 4,
                            bgcolor: 'rgba(211, 47, 47, 0.12)',
                            color: '#ffb4ab',
                            borderRadius: 1.5,
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
                <Grid container spacing={{ xs: 3, lg: 4 }} alignItems="center" justifyContent="center">


                    {/* Option 2: Upload Custom File Card */}
                    <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex' }}>
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                p: { xs: 2.5, sm: 4 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                borderRadius: 2.5,
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
                                            width: { xs: 48, sm: 56 },
                                            height: { xs: 48, sm: 56 },
                                            borderRadius: 2,
                                            bgcolor: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <UploadIcon sx={{ color: '#38BDF8', fontSize: { xs: 24, sm: 30 } }} />
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
                                            borderRadius: 1,
                                            letterSpacing: '0.04em',
                                        }}
                                    />
                                </Box>

                                <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700, mb: 1, fontSize: { xs: '1.25rem', sm: '1.65rem' } }}>
                                    Upload HTML File or Select from template
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
                                        p: { xs: 2, sm: 3 },
                                        borderRadius: 2,
                                        bgcolor: isDragOver ? 'rgba(56, 189, 248, 0.08)' : 'rgba(9, 13, 22, 0.7)',
                                        border: `2px dashed ${isDragOver ? '#38BDF8' : 'rgba(255, 255, 255, 0.12)'}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                        minHeight: { xs: 120, sm: 140 },
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
                                    <UploadIcon sx={{ color: isDragOver ? '#38BDF8' : '#64748B', fontSize: { xs: 32, sm: 38 }, mb: 1, transition: 'color 0.2s ease' }} />
                                    <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600, mb: 0.5, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                                        Drop your .html file here, or <Box component="span" sx={{ color: '#38BDF8', textDecoration: 'underline' }}>browse</Box>
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        Supports HTML5 files up to 10MB
                                    </Typography>
                                </Paper>
                            </Box>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    size="large"
                                    startIcon={<UploadIcon />}
                                    sx={{
                                        flex: 1,
                                        width: { xs: '100%', sm: 'auto' },
                                        borderRadius: 1.5,
                                        borderColor: 'rgba(56, 189, 248, 0.4)',
                                        color: '#E2E8F0',
                                        py: { xs: 1.5, sm: 1.8 },
                                        px: 3,
                                        fontWeight: 700,
                                        fontSize: { xs: '0.875rem', sm: '0.975rem' },
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
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<SparklesIcon />}
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => setIsDialogOpen(true)}
                                    sx={{
                                        flex: 1,
                                        width: { xs: '100%', sm: 'auto' },
                                        borderRadius: 1.5,
                                        background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                                        py: { xs: 1.5, sm: 1.8 },
                                        px: 3,
                                        fontWeight: 700,
                                        fontSize: { xs: '0.875rem', sm: '0.975rem' },
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
                            </Stack>
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
        </Box >
    );
};

export default UploadTemplateStep;

