import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, DesktopMac as DesktopIcon, Smartphone as MobileIcon } from '@mui/icons-material';

interface ManagePortfolioHeaderProps {
    title?: string;
    onBack: () => void;
    previewMode: 'desktop' | 'mobile';
    onTogglePreviewMode: (mode: 'desktop' | 'mobile') => void;
}

export const ManagePortfolioHeader: React.FC<ManagePortfolioHeaderProps> = ({
    title = 'Manage Portfolio 1',
    onBack,
    previewMode,
    onTogglePreviewMode,
}) => {
    return (
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                    sx={{ color: '#94A3B8', mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                    {title}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                    onClick={() => onTogglePreviewMode('desktop')}
                    sx={{
                        color: previewMode === 'desktop' ? '#C084FC' : '#64748B',
                        bgcolor: previewMode === 'desktop' ? 'rgba(192, 132, 252, 0.1)' : 'transparent',
                        borderRadius: '8px'
                    }}
                >
                    <DesktopIcon />
                </IconButton>
                <IconButton
                    onClick={() => onTogglePreviewMode('mobile')}
                    sx={{
                        color: previewMode === 'mobile' ? '#C084FC' : '#64748B',
                        bgcolor: previewMode === 'mobile' ? 'rgba(192, 132, 252, 0.1)' : 'transparent',
                        borderRadius: '8px'
                    }}
                >
                    <MobileIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default ManagePortfolioHeader;
