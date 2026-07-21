import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Container,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import {
    CheckCircleOutline as CheckIcon,
    ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { exchangeDriveToken } from '../api/driveFileService';

type SuccessStatus = 'processing' | 'success' | 'error';

const DriveSuccessPage: React.FC = () => {
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState<SuccessStatus>('processing');
    const [connectedEmail, setConnectedEmail] = useState<string>('');
    const [projectName, setProjectName] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleOAuthCallback = useCallback(async () => {
        const code = searchParams.get('code');
        const stateParam = searchParams.get('state');

        if (!code || !stateParam) {
            setError('Invalid callback — missing authorization code or state.');
            setStatus('error');
            return;
        }

        let stateData: { userId?: string; projectId?: string; projectName?: string };
        try {
            stateData = JSON.parse(stateParam);
        } catch {
            setError('Invalid callback — could not parse state.');
            setStatus('error');
            return;
        }

        const { userId, projectId, projectName: pName } = stateData;
        if (!userId || !projectId) {
            setError('Invalid callback — missing user or project information.');
            setStatus('error');
            return;
        }

        setProjectName(pName || 'Project');

        try {
            const redirectUri = `${window.location.origin}/drive/success`;
            const result = await exchangeDriveToken({
                code,
                redirectUri,
                studioUserId: userId,
                projectId: projectId,
                projectName: pName || 'Project',
            });

            setConnectedEmail(result.googleEmail);
            setStatus('success');

            // Clear the code/state from URL for cleanliness
            window.history.replaceState({}, '', '/drive/success');
        } catch (err: any) {
            console.error('Error exchanging token:', err);
            setError(err.message || 'Failed to connect Google Drive. Please try again.');
            setStatus('error');
        }
    }, [searchParams]);

    useEffect(() => {
        handleOAuthCallback();
    }, [handleOAuthCallback]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #030912 0%, #040D18 50%, #050E1A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                px: 2,
            }}
        >
            {/* Ambient glow */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '25%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: status === 'success'
                        ? 'radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(157, 78, 221, 0.12) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    pointerEvents: 'none',
                    transition: 'background 0.5s ease',
                }}
            />

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: '24px',
                        background: 'rgba(15, 26, 46, 0.72)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 8px 48px rgba(0,0,0,0.4), 0 0 80px rgba(157, 78, 221, 0.06)',
                        textAlign: 'center',
                    }}
                >
                    {/* Processing */}
                    {status === 'processing' && (
                        <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={48} sx={{ color: '#9D4EDD' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
                                Setting up your Drive...
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                Creating your Mizhiv folder and saving connection...
                            </Typography>
                        </Box>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <Box sx={{ py: 2 }}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: 'rgba(34, 197, 94, 0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                    animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    '@keyframes scaleIn': {
                                        from: { transform: 'scale(0)' },
                                        to: { transform: 'scale(1)' },
                                    },
                                }}
                            >
                                <CheckIcon sx={{ fontSize: 40, color: '#22C55E' }} />
                            </Box>

                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 700, color: '#F8FAFC', mb: 1.5 }}
                            >
                                Successfully Linked!
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#94A3B8', mb: 1 }}>
                                Your Google Drive has been connected. Thank you!
                            </Typography>
                            {connectedEmail && (
                                <Typography variant="body2" sx={{ color: '#C084FC', mb: 3 }}>
                                    Connected as {connectedEmail}
                                </Typography>
                            )}

                            <Alert
                                severity="success"
                                sx={{
                                    mb: 2,
                                    borderRadius: '12px',
                                    background: 'rgba(34, 197, 94, 0.08)',
                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                    '& .MuiAlert-icon': { color: '#22C55E' },
                                    color: '#94A3B8',
                                }}
                            >
                                A folder <strong>Mizhiv/{projectName}</strong> has been created in your Google Drive.
                            </Alert>

                            <Typography
                                variant="body2"
                                sx={{ color: '#475569', fontSize: '13px', mt: 2 }}
                            >
                                You can close this page now.
                            </Typography>
                        </Box>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <Box sx={{ py: 2 }}>
                            <Box
                                sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '50%',
                                    background: 'rgba(239, 68, 68, 0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}
                            >
                                <ErrorIcon sx={{ fontSize: 36, color: '#EF4444' }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#F8FAFC', mb: 1 }}>
                                Something went wrong
                            </Typography>
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 2,
                                    borderRadius: '12px',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                }}
                            >
                                {error}
                            </Alert>
                            <Typography
                                variant="body2"
                                sx={{ color: '#475569', fontSize: '13px' }}
                            >
                                Please ask your photographer to share a new link.
                            </Typography>
                        </Box>
                    )}
                </Paper>

                {/* Powered by Mizhiv */}
                <Typography
                    variant="body2"
                    sx={{ color: '#475569', textAlign: 'center', mt: 3, fontSize: '12px' }}
                >
                    Powered by Mizhiv • Your photos, your Drive
                </Typography>
            </Container>
        </Box>
    );
};

export default DriveSuccessPage;
