import React from 'react';
import { Box, Button, useTheme, useMediaQuery } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { usePortfolioContext } from '../context/portfolioGlobalContext';

export const PortfolioPreview: React.FC = () => {
    const theme = useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { managePortfolioController } = usePortfolioContext();

    const {
        previewMode,
        isDragging,
        blobUrl,
        iframeRef,
        setMobileView
    } = managePortfolioController;

    const isFramedMockup = !isMobileScreen && previewMode === 'mobile';

    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#0f172a', position: 'relative', height: '100%', overflow: 'hidden' }}>
            <Box
                sx={{
                    flexGrow: 1,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    p: isFramedMockup ? 2 : 0,
                    pointerEvents: isDragging ? 'none' : 'auto',
                }}
            >
                {blobUrl && (
                    <Box
                        sx={{
                            height: isFramedMockup ? '95vh' : '100%',
                            width: isFramedMockup ? 'auto' : '100%',
                            minWidth: isFramedMockup ? '360px' : 'auto',
                            aspectRatio: isFramedMockup ? '375 / 812' : 'auto',
                            maxHeight: '100%',
                            bgcolor: '#fff',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: isFramedMockup ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
                            borderRadius: isFramedMockup ? '24px' : '0',
                            overflow: 'hidden',
                            border: isFramedMockup ? '8px solid #1e293b' : 'none',
                            margin: 'auto'
                        }}
                    >
                        <iframe
                            ref={iframeRef}
                            src={blobUrl}
                            title="Live Preview"
                            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                        />
                    </Box>
                )}
            </Box>

            {/* Mobile Quick Switch Floating Action Pill */}
            {isMobileScreen && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 30,
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setMobileView('editor')}
                        sx={{
                            borderRadius: '50px',
                            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4), 0 2px 6px rgba(0,0,0,0.3)',
                            color: '#FFF',
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            letterSpacing: '0.02em',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 28px rgba(124, 58, 237, 0.6)',
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                            }
                        }}
                    >
                        Edit Content
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default PortfolioPreview;

