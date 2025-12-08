import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Button
} from '@mui/material';
import PortfolioTemplate from './PortfolioTemplate';

const PreviewStep = ({ portfolioData }) => {
    const [viewMode, setViewMode] = useState('desktop');

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Preview Your Portfolio
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant={viewMode === 'desktop' ? 'contained' : 'outlined'}
                        onClick={() => setViewMode('desktop')}
                        size="small"
                    >
                        Desktop
                    </Button>
                    <Button
                        variant={viewMode === 'mobile' ? 'contained' : 'outlined'}
                        onClick={() => setViewMode('mobile')}
                        size="small"
                    >
                        Mobile
                    </Button>
                </Box>
            </Box>

            <Card
                sx={{
                    maxWidth: viewMode === 'mobile' ? 375 : '100%',
                    mx: 'auto',
                    overflow: 'hidden',
                    transition: 'max-width 0.3s',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <PortfolioTemplate portfolioData={portfolioData} />
            </Card>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    💡 This is a preview of your portfolio. Click "Publish" to make it live!
                </Typography>
            </Box>
        </Box>
    );
};

export default PreviewStep;
