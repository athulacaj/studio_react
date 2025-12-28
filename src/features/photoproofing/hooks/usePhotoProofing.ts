import { useState, useEffect, useCallback } from 'react';
import { extractFolderId } from '../../../services/googleDrive';
import { usePhotoProofingcontext } from '..';
import { getProject, getSharedLink, getProjectTreeData } from '../../studio-management/api/projectService';
import { Project, SharedLink, DriveNode } from '../../studio-management/types';
import { useGlobalLoader } from '../../../core/context/globalLoader';

// Helper to find shared roots in the drive tree
const findSharedRoots = (folder: DriveNode, includedIds?: Set<string> | undefined, roots: DriveNode[] = []): DriveNode[] => {
    if (!folder) return roots;
    const isIncludeAll = includedIds?.has('ALL') || includedIds === undefined || includedIds === null;

    if (isIncludeAll || includedIds?.has(folder.id)) {
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
const findNodeById = (node: DriveNode, id: string): DriveNode | null => {
    if (node.id === id) return node;
    if (node.folders) {
        for (const child of Object.values(node.folders)) {
            const found = findNodeById(child, id);
            if (found) return found;
        }
    }
    return null;
};

export const usePhotoProofing = (userId: string, projectId: string, linkId?: string) => {
    const { loading, setLoading, setImages, setFolders, currentFolderId, setCurrentFolderId, setBreadcrumbs } = usePhotoProofingcontext();
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [shareLink, setShareLink] = useState<SharedLink | null>(null);

    // Cache for fetched trees: { [rootFolderId]: treeData }
    const [cachedTrees, setCachedTrees] = useState<{ [key: string]: DriveNode }>({});
    // Map to track which root a folder belongs to: { [folderId]: rootFolderId }
    const [folderRootMap, setFolderRootMap] = useState<{ [key: string]: string }>({});

    const handleLinkShared = useCallback(async (projectData: Project) => {
        let initialFolders: DriveNode[] = [];

        let initialBreadcrumbs: { id: string; name: string }[] = [];

        // 2. Handle Share Link if present
        if (linkId) {
            setLoading(true);
            const linkData = await getSharedLink(userId, projectId, linkId);
            setShareLink(linkData);

            const includedIds = new Set<string>(linkData.includedFolders || []);

            // Find the "roots" of the shared selection from the project's driveData
            if (projectData.driveData) {
                const sharedRoots = findSharedRoots(projectData.driveData);
                initialFolders = sharedRoots;
            }

            initialBreadcrumbs = [{ id: 'SHARED_ROOT', name: 'Shared Files' }];

            setCurrentFolderId(null);
            setFolders(initialFolders);
            setBreadcrumbs(initialBreadcrumbs);
            setImages([]);
            setLoading(false);
        }
    }, [linkId, userId, projectId]);

    const loadProjectAndLink = useCallback(async () => {
        try {
            // 1. Fetch Project Details
            const projectData = await getProject(userId, projectId);
            setProject(projectData);
            handleLinkShared(projectData);

            // // 2. Handle Share Link if present
            // if (linkId) {
            //     const linkData = await getSharedLink(userId, projectId, linkId);
            //     setShareLink(linkData);

            //     const includedIds = new Set<string>(linkData.includedFolders || []);

            //     // Find the "roots" of the shared selection from the project's driveData
            //     if (projectData.driveData) {
            //         const sharedRoots = findSharedRoots(projectData.driveData, includedIds);
            //         initialFolders = sharedRoots;
            //     }

            //     initialBreadcrumbs = [{ id: 'SHARED_ROOT', name: 'Shared Files' }];

            //     setCurrentFolderId(null);
            //     setFolders(initialFolders);
            //     setBreadcrumbs(initialBreadcrumbs);
            //     setImages([]);

            // } else {
            //     // 3. Normal Project View - Set Initial Folder ID from Drive URL
            //     if (projectData.source === 'google_drive' && projectData.driveUrl) {
            //         const folderId = extractFolderId(projectData.driveUrl);
            //         if (folderId) {
            //             setCurrentFolderId(folderId);
            //             setBreadcrumbs([{ id: folderId, name: 'Home' }]);

            //             // Initialize root map for the main root
            //             setFolderRootMap(prev => ({ ...prev, [folderId]: folderId }));
            //         } else {
            //             console.warn('Could not extract folder ID from URL:', projectData.driveUrl);
            //         }
            //     }
            // }

        } catch (err: unknown) {
            console.error("Error loading project:", err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, [linkId, userId, projectId]);

    useEffect(() => {
        loadProjectAndLink();
    }, [userId, projectId, linkId]);


    const fetchContent = async () => {
        if (!project) return;

        // If linkId is present and currentFolderId is null, we are at the "Shared Root"
        if (!currentFolderId && linkId) return;

        // Handle explicit SHARED_ROOT navigation
        if (currentFolderId === 'SHARED_ROOT') {
            if (linkId && shareLink && project.driveData) {
                const includedIds = new Set<string>(shareLink.includedFolders || []);
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
            let tree: DriveNode | undefined = cachedTrees[rootId];

            // Fallback: If no tree in cache, try to use project.driveData as the tree
            if (!tree && project.driveData) {
                // Check if the current folder is within driveData
                const foundInDriveData = findNodeById(project.driveData, currentFolderId);
                if (foundInDriveData) {
                    tree = project.driveData;
                }
            }

            //adde by me 
            // if (tree && !tree.files) {
            //     const { filePath, filesCount } = project[rootId];
            //     const data = await getProjectTreeData(filePath);
            //     setImages(data.files || []);
            //     tree.files = data.files;
            //     setCachedTrees(prev => ({ ...prev, [rootId]: tree as DriveNode }));

            // }



            // If we don't have the tree, we need to fetch it.
            if (!tree && rootId && project[rootId]) {
                const { filePath, filesCount } = project[rootId];

                // Show dummy files while loading
                // if (filesCount) {
                //     const dummyFiles = Array.from({ length: filesCount }).map((_, i) => ({
                //         id: `dummy-${i}`,
                //         name: 'Loading...',
                //         mimeType: 'image/jpeg', // Assumption
                //         isLoading: true
                //     }));
                //     setImages(dummyFiles);
                // }

                // Fetch from Storage
                const data = await getProjectTreeData(filePath);
                setImages(data.files || []);
                tree = data;

                // Update cache
                if (tree) {
                    setCachedTrees(prev => ({ ...prev, [rootId]: tree as DriveNode }));

                    // Update folderRootMap for all children in this tree
                    const updateMap = (node: DriveNode, rId: string) => {
                        if (node.folders) {
                            Object.values(node.folders).forEach(child => {
                                setFolderRootMap(prev => ({ ...prev, [child.id]: rId }));
                                updateMap(child, rId);
                            });
                        }
                    };
                    updateMap(tree, rootId);
                }
            }

            // Now we have the tree (hopefully), let's find the current folder node
            let currentNode: DriveNode | null = null;
            if (tree) {
                currentNode = findNodeById(tree, currentFolderId);
            } else {
                // Fallback: maybe the current folder IS the tree root we just fetched
                if (tree && (tree as DriveNode).id === currentFolderId) {
                    currentNode = tree;
                }
            }

            if (currentNode) {
                // Extract files
                const fileCount = project[currentFolderId]?.filesCount;
                const isFolderSelected = shareLink?.includedFolders?.includes(currentFolderId);
                if (fileCount && fileCount > 0 && !currentNode.files && isFolderSelected) {
                    const data = await getProjectTreeData(project[currentFolderId]?.filePath);
                    currentNode.files = data.files;

                }
                const files = currentNode.files || [];
                const mappedFiles = files.map(file => ({
                    ...file,
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
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    // Effect to fetch content when currentFolderId changes
    useEffect(() => {
        if (!currentFolderId) return;
        fetchContent();
    }, [currentFolderId]);

    return {
        loading,
        error,
        project,
        shareLink
    };
};
