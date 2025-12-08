import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Container, Alert } from '@mui/material';
import { PhotoProofingProvider } from '../../photoproofing';
import PhotoProofingPage from '../../photoproofing/pages/PhotoProofingPage';
import { usePublicProject } from '../hooks/usePublicProject';

// Wrapper component to use the context and hook
const ProjectViewer = ({ userId, projectId, linkId }) => {
    // The hook handles data fetching and updates the context (PhotoProofingProvider)
    const { loading, error, project, shareLink } = usePublicProject(userId, projectId, linkId);

    if (loading && !project) { // Only full screen loading for initial project load
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
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
            <Box sx={{ py: 4, px: 4, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    {project?.name}
                </Typography>
                {linkId && shareLink && (
                    <Typography variant="subtitle1" color="primary">
                        Shared View: {shareLink.name}
                    </Typography>
                )}
                {project?.source === 'google_drive' && (
                    <Typography variant="body2" color="text.secondary">
                        Images loaded from Google Drive (Synced)
                    </Typography>
                )}
            </Box>
            <PhotoProofingPage />
        </Box>
    );
};

const PublicProjectView = () => {
    const { userId, projectId, linkId } = useParams();

    return (
        <PhotoProofingProvider>
            <ProjectViewer userId={userId} projectId={projectId} linkId={linkId} />
        </PhotoProofingProvider>
    );
};

export default PublicProjectView;

