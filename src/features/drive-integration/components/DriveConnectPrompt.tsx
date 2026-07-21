import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    alpha,
} from '@mui/material';
import {
    Google as GoogleIcon,
    Security as SecurityIcon,
    CloudDone as CloudDoneIcon,
} from '@mui/icons-material';

interface DriveConnectPromptProps {
    userId: string;
    projectId: string;
    projectName: string;
}

/**
 * Embedded prompt card shown inside the public project view
 * when the project's source is "google_photos" and no Drive is linked yet.
 */
const DriveConnectPrompt: React.FC<DriveConnectPromptProps> = ({
    userId,
    projectId,
    projectName,
}) => {
    const navigate = useNavigate();

    const handleConnect = () => {
        navigate(`/drive/connect/${userId}/${projectId}`);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                px: 2,
            }}
        >
            <Box
                sx={{
                    maxWidth: 480,
                    width: '100%',
                    p: { xs: 3, md: 4 },
                    borderRadius: '24px',
                    background: 'rgba(15, 26, 46, 0.72)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
                    textAlign: 'center',
                    animation: 'fadeInUp 0.5s ease-out',
                    '@keyframes fadeInUp': {
                        from: { opacity: 0, transform: 'translateY(20px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                    },
                }}
            >
                {/* Icon */}
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2.5,
                        border: '1px solid rgba(157, 78, 221, 0.15)',
                    }}
                >
                    <CloudDoneIcon sx={{ fontSize: 32, color: '#C084FC' }} />
                </Box>

                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        fontSize: { xs: '20px', md: '24px' },
                        color: '#F8FAFC',
                        mb: 1,
                    }}
                >
                    Link Your Google Drive
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: '#94A3B8',
                        mb: 3,
                        lineHeight: 1.6,
                        maxWidth: 360,
                        mx: 'auto',
                    }}
                >
                    To view and save your photos from <strong style={{ color: '#C084FC' }}>{projectName}</strong>,
                    please connect your Google Drive account.
                </Typography>

                {/* Security note */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3,
                        p: 1.5,
                        borderRadius: '12px',
                        background: alpha('#22C55E', 0.06),
                        border: '1px solid rgba(34, 197, 94, 0.1)',
                        justifyContent: 'center',
                    }}
                >
                    <SecurityIcon sx={{ fontSize: 16, color: '#22C55E' }} />
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        We only access the Mizhiv folder — nothing else
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    size="large"
                    onClick={handleConnect}
                    startIcon={<GoogleIcon />}
                    sx={{
                        borderRadius: '16px',
                        background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                        boxShadow: '0 0 24px rgba(157, 78, 221, 0.3)',
                        fontWeight: 600,
                        px: 4,
                        py: 1.2,
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            background: 'linear-gradient(90deg, #6D28D9 0%, #9D4EDD 100%)',
                            boxShadow: '0 0 40px rgba(157, 78, 221, 0.4)',
                            transform: 'translateY(-2px)',
                        },
                    }}
                >
                    Connect Google Drive
                </Button>
            </Box>
        </Box>
    );
};

export default DriveConnectPrompt;
