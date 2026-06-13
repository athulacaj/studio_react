
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    CircularProgress,
    Container,
    Backdrop,
    Button,
} from '@mui/material';
import {
    ErrorOutline as ErrorIcon,
    LinkOff as LinkOffIcon,
    CameraAlt as CameraIcon,
    Home as HomeIcon,
} from '@mui/icons-material';
import PhotoProofingPage from '../../photoproofing/pages/PhotoProofingPage';
import { usePhotoProofing } from '../../photoproofing/hooks/';

// ─── Premium Loading Screen ────────────────────────────────────────────────────
const PremiumLoadingScreen = () => (
    <Box
        sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #030912 0%, #040D18 50%, #050E1A 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        {/* Ambient glow orb */}
        <Box
            sx={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(157, 78, 221, 0.15) 0%, transparent 70%)',
                filter: 'blur(80px)',
                pointerEvents: 'none',
                animation: 'glowPulse 3s ease-in-out infinite',
            }}
        />

        {/* Spinner Container */}
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                animation: 'fadeInUp 0.6s ease-out',
                '@keyframes fadeInUp': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                },
            }}
        >
            <CircularProgress
                size={64}
                thickness={2}
                sx={{
                    color: '#9D4EDD',
                    filter: 'drop-shadow(0 0 12px rgba(157, 78, 221, 0.4))',
                }}
            />
            <CameraIcon
                sx={{
                    position: 'absolute',
                    fontSize: 28,
                    color: '#C084FC',
                    animation: 'glowPulse 2s ease-in-out infinite',
                }}
            />
        </Box>

        <Typography
            variant="h6"
            sx={{
                fontWeight: 600,
                fontSize: '18px',
                background: 'linear-gradient(135deg, #F8FAFC 0%, #C084FC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                animation: 'fadeInUp 0.6s ease-out 0.15s both',
            }}
        >
            Loading your gallery
        </Typography>
        <Typography
            variant="body2"
            sx={{
                color: '#64748B',
                fontSize: '14px',
                animation: 'fadeInUp 0.6s ease-out 0.3s both',
            }}
        >
            Preparing a cinematic experience...
        </Typography>
    </Box>
);

// ─── Premium Error State ────────────────────────────────────────────────────────
const PremiumErrorState = ({ message }: { message: string }) => (
    <Box
        sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #030912 0%, #040D18 50%, #050E1A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        {/* Ambient error glow */}
        <Box
            sx={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
            }}
        />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
                sx={{
                    p: { xs: 4, md: 5 },
                    borderRadius: '24px',
                    background: 'rgba(15, 26, 46, 0.72)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 40px rgba(239, 68, 68, 0.08)',
                    textAlign: 'center',
                    animation: 'fadeInUp 0.6s ease-out',
                    '@keyframes fadeInUp': {
                        from: { opacity: 0, transform: 'translateY(20px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                    },
                }}
            >
                {/* Error icon container */}
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '20px',
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

                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        fontSize: { xs: '22px', md: '26px' },
                        color: '#F8FAFC',
                        mb: 1.5,
                    }}
                >
                    Something went wrong
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: '#94A3B8',
                        fontSize: '15px',
                        mb: 4,
                        lineHeight: 1.6,
                        maxWidth: 400,
                        mx: 'auto',
                    }}
                >
                    {message}
                </Typography>

                <Button
                    component={Link}
                    to="/"
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    sx={{
                        borderRadius: '16px',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#C084FC',
                        fontWeight: 600,
                        px: 3,
                        py: 1.2,
                        background: 'rgba(157, 78, 221, 0.06)',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            borderColor: '#9D4EDD',
                            background: 'rgba(157, 78, 221, 0.12)',
                            boxShadow: '0 0 24px rgba(157, 78, 221, 0.2)',
                            transform: 'translateY(-2px)',
                        },
                    }}
                >
                    Go Home
                </Button>
            </Box>
        </Container>
    </Box>
);

// ─── Premium Invalid URL State ──────────────────────────────────────────────────
const PremiumInvalidUrlState = () => (
    <Box
        sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #030912 0%, #040D18 50%, #050E1A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        {/* Ambient glow orb */}
        <Box
            sx={{
                position: 'absolute',
                top: '35%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
            }}
        />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
                sx={{
                    p: { xs: 4, md: 5 },
                    borderRadius: '24px',
                    background: 'rgba(15, 26, 46, 0.72)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 40px rgba(245, 158, 11, 0.06)',
                    textAlign: 'center',
                    animation: 'fadeInUp 0.6s ease-out',
                    '@keyframes fadeInUp': {
                        from: { opacity: 0, transform: 'translateY(20px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                    },
                }}
            >
                {/* Warning icon container */}
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '20px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                    }}
                >
                    <LinkOffIcon sx={{ fontSize: 36, color: '#F59E0B' }} />
                </Box>

                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        fontSize: { xs: '22px', md: '26px' },
                        color: '#F8FAFC',
                        mb: 1.5,
                    }}
                >
                    Invalid Project URL
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: '#94A3B8',
                        fontSize: '15px',
                        mb: 4,
                        lineHeight: 1.6,
                        maxWidth: 400,
                        mx: 'auto',
                    }}
                >
                    The link you followed appears to be broken or the project may no longer exist. Please check the URL and try again.
                </Typography>

                <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    startIcon={<HomeIcon />}
                    sx={{
                        borderRadius: '16px',
                        background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                        boxShadow: '0 0 30px rgba(157, 78, 221, 0.3)',
                        fontWeight: 600,
                        px: 3,
                        py: 1.2,
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            background: 'linear-gradient(90deg, #6D28D9 0%, #9D4EDD 100%)',
                            boxShadow: '0 0 50px rgba(157, 78, 221, 0.45)',
                            transform: 'translateY(-2px)',
                        },
                    }}
                >
                    Go Home
                </Button>
            </Box>
        </Container>
    </Box>
);

// ─── Wrapper component to use the context and hook ──────────────────────────────
const ProjectViewer = ({ userId, projectId, linkId }: { userId: string, projectId: string, linkId?: string }) => {
    // The hook handles data fetching and updates the store
    const { loading, error, project } = usePhotoProofing(userId, projectId, linkId);

    if (loading && !project) { // Only full screen loading for initial project load
        return <PremiumLoadingScreen />;
    }

    if (error) {
        return <PremiumErrorState message={error} />;
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #030912 0%, #050E1A 100%)',
                position: 'relative',
            }}
        >
            <PhotoProofingPage />
            <Backdrop
                sx={{
                    color: '#C084FC',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: 'rgba(3, 9, 18, 0.7)',
                    backdropFilter: 'blur(8px)',
                }}
                open={loading}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress
                        sx={{
                            color: '#9D4EDD',
                            filter: 'drop-shadow(0 0 12px rgba(157, 78, 221, 0.4))',
                        }}
                    />
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#94A3B8',
                            fontWeight: 500,
                        }}
                    >
                        Updating gallery...
                    </Typography>
                </Box>
            </Backdrop>
        </Box>
    );
};

const PublicProjectView = () => {
    const { userId, projectId, linkId } = useParams<{ userId: string; projectId: string; linkId?: string }>();

    if (!userId || !projectId) {
        return <PremiumInvalidUrlState />;
    }

    return (
        <ProjectViewer userId={userId} projectId={projectId} linkId={linkId} />
    );
};

export default PublicProjectView;
