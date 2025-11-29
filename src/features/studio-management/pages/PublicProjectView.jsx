import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Container, Alert } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { fetchDriveImages, extractFolderId, fetchDriveFolders } from '../../../services/googleDrive';
import { PhotoProofingProvider, usePhotoProofing } from '../../photoproofing';
import PhotoProofingPage from '../../photoproofing/pages/PhotoProofingPage';

// Wrapper component to use the context
const ProjectViewer = ({ projectId }) => {
    const { setImages, setFolders, currentFolderId, setCurrentFolderId, setBreadcrumbs } = usePhotoProofing();
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

                // 2. Set Initial Folder ID
                if (projectData.source === 'google_drive' && projectData.driveUrl) {
                    const folderId = extractFolderId(projectData.driveUrl);
                    if (folderId) {
                        // Only set if not already set (to avoid overriding navigation if this effect re-runs)
                        // But since this is mount, it should be fine.
                        // However, we need to check if currentFolderId is null.
                        // Actually, since we want to trigger the fetch effect, we should set it.
                        // But we need to be careful not to cause loops if loadProject runs again.
                        // Given the dependency array [projectId], it should only run once per project.
                        setCurrentFolderId(folderId);

                        // Set initial breadcrumb
                        setBreadcrumbs([{ id: folderId, name: 'Home' }]);
                    } else {
                        console.warn('Could not extract folder ID from URL:', projectData.driveUrl);
                    }
                }

            } catch (err) {
                console.error("Error loading project:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [projectId, setCurrentFolderId, setBreadcrumbs]);

    // Effect to fetch content when currentFolderId changes
    useEffect(() => {
        const fetchContent = async () => {
            if (!currentFolderId) return;

            setLoading(true);
            try {
                const [imagesData, foldersData] = await Promise.all([
                    fetchDriveImages(currentFolderId),
                    fetchDriveFolders(currentFolderId)
                ]);

                setImages(imagesData);
                setFolders(foldersData);
            } catch (err) {
                console.error("Error fetching Drive content:", err);
                // Don't block UI, just log error or show toast?
                // For now, maybe just empty lists
                setImages([]);
                setFolders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [currentFolderId, setImages, setFolders]);

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
