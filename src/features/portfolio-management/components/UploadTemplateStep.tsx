import React from 'react';
import { Box, Container, Paper, Typography, Button, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon, CloudUpload as UploadIcon } from '@mui/icons-material';

interface UploadTemplateStepProps {
    error: string | null;
    onNavigateBack: () => void;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadTemplateStep: React.FC<UploadTemplateStepProps> = ({
    error,
    onNavigateBack,
    onFileUpload,
}) => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#030912', pt: 8, pb: 4 }}>
            <Container maxWidth="sm">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onNavigateBack}
                    sx={{ color: '#94A3B8', mb: 4 }}
                >
                    Back to Dashboard
                </Button>
                <Paper
                    sx={{
                        p: 6,
                        borderRadius: 4,
                        bgcolor: 'rgba(15, 26, 46, 0.6)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h4" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                        Upload Template
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4 }}>
                        Please upload your vanilla JS HTML template containing the portfolioData configuration.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 4, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ffb4ab' }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadIcon />}
                        size="large"
                        sx={{
                            borderRadius: '12px',
                            background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                            px: 4,
                            py: 1.5,
                        }}
                    >
                        Select HTML File
                        <input
                            type="file"
                            hidden
                            accept=".html,text/html"
                            onChange={onFileUpload}
                        />
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
};

export default UploadTemplateStep;
