import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Container, Alert } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { fetchDriveImages, extractFolderId } from '../../../services/googleDrive';
import { PhotoProofingProvider, usePhotoProofing } from '../../photoproofing';
import PhotoProofingPage from '../../photoproofing/pages/PhotoProofingPage';

// Wrapper component to use the context
const ProjectViewer = ({ projectId }) => {
    const { setImages } = usePhotoProofing();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [project, setProject] = useState(null);

    useEffect(() => {
        const loadProject = async () => {
            try {
                // 1. Fetch Project Details
                const projectRef = doc(db, 'projects', projectId);
                const projectSnap = await getDoc(projectRef);

                if (!projectSnap.exists()) {
                    throw new Error('Project not found');
                }

                const projectData = projectSnap.data();
                setProject(projectData);

                // 2. Fetch Images
                let imageFiles = [];
                if (projectData.source === 'google_drive' && projectData.driveUrl) {
                    const folderId = extractFolderId(projectData.driveUrl);
                    if (folderId) {
                        imageFiles = await fetchDriveImages(folderId);
                    } else {
                        console.warn('Could not extract folder ID from URL:', projectData.driveUrl);
                    }
                } else if (projectData.source === 'google_photos') {
                    // Placeholder for Google Photos integration
                    // For now, maybe load some dummy images or show a message
                    console.log('Google Photos source selected');
                    // imageUrls = ...
                }

                // 3. Update Context
                setImages(imageFiles);

            } catch (err) {
                console.error("Error loading project:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [projectId, setImages]);

    if (loading) {
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
                {project?.source === 'google_drive' && (
                    <Typography variant="body2" color="text.secondary">
                        Images loaded from Google Drive
                    </Typography>
                )}
            </Box>
            <PhotoProofingPage />
        </Box>
    );
};

const PublicProjectView = () => {
    const { projectId } = useParams();

    return (
        <PhotoProofingProvider>
            <ProjectViewer projectId={projectId} />
        </PhotoProofingProvider>
    );
};

export default PublicProjectView;
