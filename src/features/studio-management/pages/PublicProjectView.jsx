import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Container, Alert } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { fetchDriveImages, extractFolderId, fetchDriveFolders } from '../../../services/googleDrive';
import { PhotoProofingProvider, usePhotoProofing } from '../../photoproofing';
import PhotoProofingPage from '../../photoproofing/pages/PhotoProofingPage';

// Helper to find shared roots in the drive tree
const findSharedRoots = (folder, includedIds, roots = []) => {
    if (!folder) return roots;

    if (includedIds.has(folder.id)) {
        roots.push(folder);
        // If this folder is included, we don't need to check its children for roots
        // because this folder acts as the root for its subtree.
        return roots;
    }

    if (folder.folders) {
        Object.values(folder.folders).forEach(child => {
            findSharedRoots(child, includedIds, roots);
        });
    }
    return roots;
};

// Wrapper component to use the context
const ProjectViewer = ({ userId, projectId, linkId }) => {
    const { setImages, setFolders, currentFolderId, setCurrentFolderId, setBreadcrumbs, breadcrumbs } = usePhotoProofing();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [project, setProject] = useState(null);
    const [shareLink, setShareLink] = useState(null);

    useEffect(() => {
        const loadProjectAndLink = async () => {
            try {
                // 1. Fetch Project Details
                const projectRef = doc(db, 'projects', userId, 'projects', projectId);
                const projectSnap = await getDoc(projectRef);

                if (!projectSnap.exists()) {
                    throw new Error('Project not found');
                }

                const projectData = projectSnap.data();
                setProject(projectData);

                let initialFolderId = null;
                let initialFolders = [];
                let initialBreadcrumbs = [];

                // 2. Handle Share Link if present
                if (linkId) {
                    const linkRef = doc(db, 'projects', userId, 'projects', projectId, 'shared_links', linkId);
                    const linkSnap = await getDoc(linkRef);

                    if (!linkSnap.exists()) {
                        throw new Error('Share link not found');
                    }

                    const linkData = linkSnap.data();
                    setShareLink(linkData);

                    const includedIds = new Set(linkData.includedFolders || []);

                    // Find the "roots" of the shared selection from the project's driveData
                    const sharedRoots = findSharedRoots(projectData.driveData, includedIds);

                    initialFolders = sharedRoots;
                    initialBreadcrumbs = [{ id: 'SHARED_ROOT', name: 'Shared Files' }];

                    // We don't set currentFolderId to a real ID initially, 
                    // instead we let the "Shared Files" view render the roots.
                    // We use a special ID 'SHARED_ROOT' to denote this state if needed, 
                    // or just rely on currentFolderId being null/undefined and manually setting folders.
                    setCurrentFolderId(null);
                    setFolders(initialFolders);
                    setBreadcrumbs(initialBreadcrumbs);
                    setImages([]); // No images at root level of share

                } else {
                    // 3. Normal Project View - Set Initial Folder ID from Drive URL
                    if (projectData.source === 'google_drive' && projectData.driveUrl) {
                        const folderId = extractFolderId(projectData.driveUrl);
                        if (folderId) {
                            setCurrentFolderId(folderId);
                            setBreadcrumbs([{ id: folderId, name: 'Home' }]);
                        } else {
                            console.warn('Could not extract folder ID from URL:', projectData.driveUrl);
                        }
                    }
                }

            } catch (err) {
                console.error("Error loading project:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadProjectAndLink();
    }, [userId, projectId, linkId, setCurrentFolderId, setBreadcrumbs, setFolders, setImages]);

    // Effect to fetch content when currentFolderId changes
    useEffect(() => {
        const fetchContent = async () => {
            // If linkId is present and currentFolderId is null, we are at the "Shared Root"
            // which was handled in the initial load. We shouldn't fetch anything here.
            if (!currentFolderId && linkId) return;

            if (!currentFolderId) return;

            setLoading(true);
            try {
                const [imagesData, foldersData] = await Promise.all([
                    fetchDriveImages(currentFolderId, breadcrumbs),
                    fetchDriveFolders(currentFolderId)
                ]);

                setImages(imagesData);
                setFolders(foldersData);
            } catch (err) {
                console.error("Error fetching Drive content:", err);
                setImages([]);
                setFolders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [currentFolderId, linkId, setImages, setFolders, breadcrumbs]);

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
                {linkId && shareLink && (
                    <Typography variant="subtitle1" color="primary">
                        Shared View: {shareLink.name}
                    </Typography>
                )}
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
    const { userId, projectId, linkId } = useParams();

    return (
        <PhotoProofingProvider>
            <ProjectViewer userId={userId} projectId={projectId} linkId={linkId} />
        </PhotoProofingProvider>
    );
};

export default PublicProjectView;
