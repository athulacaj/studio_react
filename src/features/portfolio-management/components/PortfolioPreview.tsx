import React from 'react';
import { Box } from '@mui/material';
import { usePortfolioContext } from '../context/portfolioGlobalContext';



export const PortfolioPreview: React.FC = () => {
    const { managePortfolioController } = usePortfolioContext();

    const {
        previewMode,
        isDragging,
        blobUrl,
        iframeRef } = managePortfolioController;

    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>
            <Box
                sx={{
                    flexGrow: 1,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    p: previewMode === 'mobile' ? 2 : 0,
                    pointerEvents: isDragging ? 'none' : 'auto',
                }}
            >
                {blobUrl && (
                    <Box
                        sx={{
                            height: previewMode === 'mobile' ? '95vh' : '100%',
                            width: previewMode === 'mobile' ? 'auto' : '100%',
                            minWidth: previewMode === 'mobile' ? '400px' : 'auto',
                            aspectRatio: previewMode === 'mobile' ? '375 / 812' : 'auto',
                            maxHeight: '100%',
                            bgcolor: '#fff',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: previewMode === 'mobile' ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
                            borderRadius: previewMode === 'mobile' ? '24px' : '0',
                            overflow: 'hidden',
                            border: previewMode === 'mobile' ? '8px solid #1e293b' : 'none',
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
        </Box>
    );
};

export default PortfolioPreview;

