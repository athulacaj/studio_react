import React from 'react';
import { Box, Typography, Button, IconButton, useTheme, useMediaQuery, ToggleButtonGroup, ToggleButton } from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    DesktopMac as DesktopIcon,
    Smartphone as MobileIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { usePortfolioContext } from '../context/portfolioGlobalContext';

interface ManagePortfolioHeaderProps {
    title?: string;
}

export const ManagePortfolioHeader: React.FC<ManagePortfolioHeaderProps> = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { managePortfolioController } = usePortfolioContext();

    const {
        previewMode,
        setPreviewMode,
        mobileView,
        setMobileView,
        title,
        handleBack
    } = managePortfolioController;

    return (
        <Box
            sx={{
                p: { xs: 1.5, sm: 2 },
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                bgcolor: 'rgba(15, 26, 46, 0.95)',
                backdropFilter: 'blur(10px)',
                minHeight: 56,
            }}
        >
            {/* Left: Back Button & Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                        color: '#94A3B8',
                        mr: { xs: 1, sm: 2 },
                        px: { xs: 1, sm: 1.5 },
                        py: 0.5,
                        minWidth: 'auto',
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        '&:hover': {
                            color: '#FFF',
                            bgcolor: 'rgba(255,255,255,0.08)',
                            borderColor: 'rgba(255,255,255,0.15)'
                        }
                    }}
                >
                    Back
                </Button>
                <Typography
                    variant="h6"
                    sx={{
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: { xs: '0.9375rem', sm: '1.125rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        letterSpacing: '-0.01em',
                    }}
                >
                    {title || 'Portfolio Editor'}
                </Typography>
            </Box>

            {/* Right: View Switcher for Mobile OR Device Switcher for Desktop */}
            {isMobile ? (
                <ToggleButtonGroup
                    value={mobileView || 'editor'}
                    exclusive
                    onChange={(_, nextView) => {
                        if (nextView) setMobileView(nextView);
                    }}
                    size="small"
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.04)',
                        borderRadius: 1.5,
                        border: '1px solid rgba(255,255,255,0.08)',
                        p: '2px',
                        '& .MuiToggleButton-root': {
                            color: '#94A3B8',
                            border: 'none',
                            borderRadius: '6px',
                            px: { xs: 1.25, sm: 1.75 },
                            py: 0.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            gap: 0.5,
                            transition: 'all 0.2s ease',
                            '&.Mui-selected': {
                                color: '#FFF',
                                bgcolor: 'rgba(124, 58, 237, 0.4)',
                                border: '1px solid rgba(168, 85, 247, 0.5)',
                                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                                '&:hover': {
                                    bgcolor: 'rgba(124, 58, 237, 0.5)',
                                }
                            },
                            '&:hover': {
                                color: '#FFF',
                                bgcolor: 'rgba(255,255,255,0.08)',
                            }
                        }
                    }}
                >
                    <ToggleButton value="editor">
                        <EditIcon sx={{ fontSize: 15 }} />
                        Edit
                    </ToggleButton>
                    <ToggleButton value="preview">
                        <VisibilityIcon sx={{ fontSize: 15 }} />
                        Preview
                    </ToggleButton>
                </ToggleButtonGroup>
            ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        onClick={() => setPreviewMode('desktop')}
                        sx={{
                            color: previewMode === 'desktop' ? '#C084FC' : '#64748B',
                            bgcolor: previewMode === 'desktop' ? 'rgba(192, 132, 252, 0.1)' : 'transparent',
                            borderRadius: 1.5,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: 'rgba(192, 132, 252, 0.15)', color: '#C084FC' }
                        }}
                        title="Desktop Preview Mode"
                    >
                        <DesktopIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => setPreviewMode('mobile')}
                        sx={{
                            color: previewMode === 'mobile' ? '#C084FC' : '#64748B',
                            bgcolor: previewMode === 'mobile' ? 'rgba(192, 132, 252, 0.1)' : 'transparent',
                            borderRadius: 1.5,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: 'rgba(192, 132, 252, 0.15)', color: '#C084FC' }
                        }}
                        title="Mobile Device Mockup Mode"
                    >
                        <MobileIcon />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};

export default ManagePortfolioHeader;
