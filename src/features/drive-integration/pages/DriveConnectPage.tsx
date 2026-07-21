import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    CircularProgress,
    Alert,
    Paper,
    alpha,
} from '@mui/material';
import {
    Google as GoogleIcon,
    CloudDone as CloudDoneIcon,
    Security as SecurityIcon,
    FolderSpecial as FolderIcon,
} from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

import type { Project } from '../../studio-management/types';

const GOOGLE_DRIVE_CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

type ConnectStatus = 'idle' | 'loading-project' | 'ready' | 'connecting' | 'error' | 'already-connected';

const DriveConnectPage: React.FC = () => {
    const { userId, projectId } = useParams<{ userId: string; projectId: string }>();

    const [status, setStatus] = useState<ConnectStatus>('loading-project');
    const [project, setProject] = useState<Project | null>(null);
    const [error, setError] = useState<string>('');

    // Load project info
    useEffect(() => {
        const loadProject = async () => {
            if (!userId || !projectId) {
                setError('Invalid URL — missing project information.');
                setStatus('error');
                return;
            }

            try {
                const projectDoc = await getDoc(doc(db, 'projects', userId, 'projects', projectId));
                if (!projectDoc.exists()) {
                    setError('Project not found. Please check the link and try again.');
                    setStatus('error');
                    return;
                }

                const projectData = { id: projectDoc.id, ...projectDoc.data() } as Project;
                setProject(projectData);

                // Check if already connected
                if (projectData.driveConnectionId) {
                    setStatus('already-connected');
                    return;
                }

                setStatus('ready');
            } catch (err) {
                console.error('Error loading project:', err);
                setError('Failed to load project information.');
                setStatus('error');
            }
        };

        loadProject();
    }, [userId, projectId]);

    const handleConnectDrive = () => {
        if (!GOOGLE_DRIVE_CLIENT_ID) {
            setError('Google Drive is not configured. Please contact the administrator.');
            setStatus('error');
            return;
        }

        setStatus('connecting');
        const redirectUri = `${window.location.origin}/drive/success`;
        const statePayload = JSON.stringify({ userId, projectId, projectName: project?.name || 'Project' });
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', GOOGLE_DRIVE_CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', SCOPES);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');
        authUrl.searchParams.set('include_granted_scopes', 'true');
        authUrl.searchParams.set('state', statePayload);

        window.location.href = authUrl.toString();
    };


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
                    background: 'radial-gradient(circle, rgba(157, 78, 221, 0.12) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    pointerEvents: 'none',
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
                    {/* Loading project */}
                    {status === 'loading-project' && (
                        <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={48} sx={{ color: '#9D4EDD' }} />
                            <Typography variant="body1" sx={{ color: '#94A3B8' }}>
                                Loading project...
                            </Typography>
                        </Box>
                    )}

                    {/* Ready to connect */}
                    {status === 'ready' && (
                        <>
                            {/* Icon */}
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '24px',
                                    background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.2) 0%, rgba(168, 85, 247, 0.12) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                    border: '1px solid rgba(157, 78, 221, 0.2)',
                                }}
                            >
                                <GoogleIcon sx={{ fontSize: 40, color: '#C084FC' }} />
                            </Box>

                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '24px', md: '28px' },
                                    background: 'linear-gradient(135deg, #F8FAFC 0%, #C084FC 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1.5,
                                }}
                            >
                                Link Your Google Drive
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{ color: '#94A3B8', mb: 4, lineHeight: 1.7, maxWidth: 400, mx: 'auto' }}
                            >
                                Connect your Google Drive to save your photos from
                                <strong style={{ color: '#C084FC' }}> {project?.name || 'this project'}</strong> directly
                                to your own Drive account.
                            </Typography>

                            {/* Security info */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    mb: 4,
                                    p: 2.5,
                                    borderRadius: '16px',
                                    background: alpha('#9D4EDD', 0.06),
                                    border: '1px solid rgba(157, 78, 221, 0.1)',
                                    textAlign: 'left',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <SecurityIcon sx={{ fontSize: 20, color: '#22C55E' }} />
                                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '13px' }}>
                                        We only access the <strong>Mizhiv</strong> folder — nothing else in your Drive
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <FolderIcon sx={{ fontSize: 20, color: '#38BDF8' }} />
                                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '13px' }}>
                                        A folder <strong>Mizhiv/{project?.name}</strong> will be created in your Drive
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <CloudDoneIcon sx={{ fontSize: 20, color: '#C084FC' }} />
                                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '13px' }}>
                                        Your photos stay safe in your own Google Drive
                                    </Typography>
                                </Box>
                            </Box>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleConnectDrive}
                                startIcon={<GoogleIcon />}
                                sx={{
                                    borderRadius: '16px',
                                    background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                                    boxShadow: '0 0 30px rgba(157, 78, 221, 0.3)',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    px: 5,
                                    py: 1.5,
                                    width: '100%',
                                    maxWidth: 320,
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        background: 'linear-gradient(90deg, #6D28D9 0%, #9D4EDD 100%)',
                                        boxShadow: '0 0 50px rgba(157, 78, 221, 0.45)',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                Connect with Google
                            </Button>
                        </>
                    )}

                    {/* Connecting */}
                    {status === 'connecting' && (
                        <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={48} sx={{ color: '#9D4EDD' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
                                Redirecting to Google...
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                Please sign in with your Google account
                            </Typography>
                        </Box>
                    )}


                    {/* Already Connected */}
                    {status === 'already-connected' && (
                        <Box sx={{ py: 2 }}>
                            <Box
                                sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '50%',
                                    background: 'rgba(56, 189, 248, 0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}
                            >
                                <CloudDoneIcon sx={{ fontSize: 36, color: '#38BDF8' }} />
                            </Box>

                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#F8FAFC', mb: 1.5 }}>
                                Already Connected
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#94A3B8', mb: 2 }}>
                                A Google Drive account is already linked to this project. Thank you!
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{ color: '#475569', fontSize: '13px', mt: 1 }}
                            >
                                You can close this page now.
                            </Typography>
                        </Box>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <Box sx={{ py: 2 }}>
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    borderRadius: '12px',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                }}
                            >
                                {error}
                            </Alert>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setError('');
                                    setStatus('ready');
                                }}
                                sx={{
                                    borderRadius: '16px',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: '#C084FC',
                                    fontWeight: 600,
                                    px: 4,
                                }}
                            >
                                Try Again
                            </Button>
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

export default DriveConnectPage;
