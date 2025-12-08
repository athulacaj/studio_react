import { useState, useEffect } from 'react';
import { extractFolderId } from '../../../services/googleDrive';
import { usePhotoProofing } from '../../photoproofing';
import { getProject, getSharedLink, getProjectTreeData } from '../api/projectService';

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

// Helper to find a node in the tree by ID
const findNodeById = (node, id) => {
    if (node.id === id) return node;
    if (node.folders) {
        for (const child of Object.values(node.folders)) {
            const found = findNodeById(child, id);
            if (found) return found;
        }
    }
    return null;
};

export const usePublicProject = (userId, projectId, linkId) => {
    const { setImages, setFolders, currentFolderId, setCurrentFolderId, setBreadcrumbs, breadcrumbs } = usePhotoProofing();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [project, setProject] = useState(null);
    const [shareLink, setShareLink] = useState(null);

    // Cache for fetched trees: { [rootFolderId]: treeData }
    const [cachedTrees, setCachedTrees] = useState({});
    // Map to track which root a folder belongs to: { [folderId]: rootFolderId }
    const [folderRootMap, setFolderRootMap] = useState({});

    useEffect(() => {
        const loadProjectAndLink = async () => {
            try {
                // 1. Fetch Project Details
                const projectData = await getProject(userId, projectId);
                setProject(projectData);

                let initialFolders = [];
                let initialBreadcrumbs = [];

                // 2. Handle Share Link if present
                if (linkId) {
                    const linkData = await getSharedLink(userId, projectId, linkId);
                    setShareLink(linkData);

                    const includedIds = new Set(linkData.includedFolders || []);

                    // Find the "roots" of the shared selection from the project's driveData
                    if (projectData.driveData) {
                        const sharedRoots = findSharedRoots(projectData.driveData, includedIds);
                        initialFolders = sharedRoots;
                    }

                    initialBreadcrumbs = [{ id: 'SHARED_ROOT', name: 'Shared Files' }];

                    setCurrentFolderId(null);
                    setFolders(initialFolders);
                    setBreadcrumbs(initialBreadcrumbs);
                    setImages([]);

                } else {
                    // 3. Normal Project View - Set Initial Folder ID from Drive URL
                    if (projectData.source === 'google_drive' && projectData.driveUrl) {
                        const folderId = extractFolderId(projectData.driveUrl);
                        if (folderId) {
                            setCurrentFolderId(folderId);
                            setBreadcrumbs([{ id: folderId, name: 'Home' }]);

                            // Initialize root map for the main root
                            setFolderRootMap(prev => ({ ...prev, [folderId]: folderId }));
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
            if (!project) return;

            // If linkId is present and currentFolderId is null, we are at the "Shared Root"
            if (!currentFolderId && linkId) return;

            // Handle explicit SHARED_ROOT navigation
            if (currentFolderId === 'SHARED_ROOT') {
                if (linkId && shareLink && project.driveData) {
                    const includedIds = new Set(shareLink.includedFolders || []);
                    const sharedRoots = findSharedRoots(project.driveData, includedIds);
                    setFolders(sharedRoots);
                    setImages([]);
                    return;
                }
            }

            if (!currentFolderId) return;

            setLoading(true);
            try {
                // Determine the root for this folder
                let rootId = folderRootMap[currentFolderId];

                // If not in map, check if it's a direct key in projectData (meaning it's a root itself)
                if (!rootId && project[currentFolderId]) {
                    rootId = currentFolderId;
                    setFolderRootMap(prev => ({ ...prev, [currentFolderId]: currentFolderId }));
                }

                // Let's try to find the tree data.
                let tree = cachedTrees[rootId];

                // Fallback: If no tree in cache, try to use project.driveData as the tree
                if (!tree && project.driveData) {
                    // Check if the current folder is within driveData
                    const foundInDriveData = findNodeById(project.driveData, currentFolderId);
                    if (foundInDriveData) {
                        tree = project.driveData;
                    }
                }

                // If we don't have the tree, we need to fetch it.
                if (!tree && rootId && project[rootId]) {
                    const { filePath, filesCount } = project[rootId];

                    // Show dummy files while loading
                    if (filesCount) {
                        const dummyFiles = Array.from({ length: filesCount }).map((_, i) => ({
                            id: `dummy-${i}`,
                            name: 'Loading...',
                            mimeType: 'image/jpeg', // Assumption
                            isLoading: true
                        }));
                        setImages(dummyFiles);
                    }

                    // Fetch from Storage
                    const data = await getProjectTreeData(filePath);
                    tree = data;

                    // Update cache
                    setCachedTrees(prev => ({ ...prev, [rootId]: tree }));

                    // Update folderRootMap for all children in this tree
                    const updateMap = (node, rId) => {
                        if (node.folders) {
                            Object.values(node.folders).forEach(child => {
                                setFolderRootMap(prev => ({ ...prev, [child.id]: rId }));
                                updateMap(child, rId);
                            });
                        }
                    };
                    updateMap(tree, rootId);
                }

                // Now we have the tree (hopefully), let's find the current folder node
                let currentNode = null;
                if (tree) {
                    currentNode = findNodeById(tree, currentFolderId);
                } else {
                    // Fallback: maybe the current folder IS the tree root we just fetched
                    if (tree && tree.id === currentFolderId) {
                        currentNode = tree;
                    }
                }

                if (currentNode) {
                    // Extract files
                    const files = currentNode.files || [];
                    const mappedFiles = files.map(file => ({
                        ...file,
                        src: file.url || file.webViewLink,
                        src: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1920`,
                        thumbnailLink: file.thumbnailLink,
                        folderId: currentFolderId
                    }));

                    setImages(mappedFiles);

                    // Extract subfolders
                    const subfolders = currentNode.folders ? Object.values(currentNode.folders) : [];
                    setFolders(subfolders);
                } else {
                    console.warn("Could not find node for", currentFolderId);
                    setImages([]);
                    setFolders([]);
                }

            } catch (err) {
                console.error("Error fetching Drive content:", err);
                setImages([]);
                setFolders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [currentFolderId, linkId, project, cachedTrees, folderRootMap, setImages, setFolders, shareLink]);

    return {
        loading,
        error,
        project,
        shareLink
    };
};
