import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Container, Alert, Backdrop } from '@mui/material';
import { PhotoProofingProvider } from '../../photoproofing';
import PhotoProofingPage from '../../photoproofing/pages/PhotoProofingPage';
import { usePhotoProofing } from '../../photoproofing/hooks/usePhotoProofing';

// Wrapper component to use the context and hook
const ProjectViewer = ({ userId, projectId, linkId }: { userId: string, projectId: string, linkId?: string }) => {
    // The hook handles data fetching and updates the context (PhotoProofingProvider)
    const { loading, error, project, shareLink } = usePhotoProofing(userId, projectId, linkId);

    if (loading && !project) { // Only full screen loading for initial project load
        return (
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Alert severity="error">
                    <Typography variant="h6">Error Loading Project</Typography>
                    <Typography>{error}</Typography>
                </Alert>
            </Container>
        );
    }

    return (
        <Box>

            <PhotoProofingPage />
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
};

const PublicProjectView = () => {
    const { userId, projectId, linkId } = useParams<{ userId: string; projectId: string; linkId?: string }>();

    if (!userId || !projectId) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Alert severity="error">
                    Invalid Project URL
                </Alert>
            </Container>
        );
    }

    return (
        <PhotoProofingProvider>
            <ProjectViewer userId={userId} projectId={projectId} linkId={linkId} />
        </PhotoProofingProvider>
    );
};

export default PublicProjectView;

