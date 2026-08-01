import { useState, useEffect, useCallback, useRef } from 'react';
import { usePhotoProofingStore } from '../store/usePhotoProofingStore';
import { getProject, getSharedLink, getProjectTreeData, getSyncedFolders } from '../../studio-management/api/projectService';
import { Project, SharedLink, DriveNode, ProjectJoinDriveData, DriveData } from '../../studio-management/types';
import { albumSyncService } from '../services/AlbumSyncService';
import { useSearchParams } from 'react-router-dom';
import { AlbumCategory } from '../types';

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

// Helper to find path to a node
const findPathToNode = (node: DriveNode, targetId: string, path: { id: string, name: string }[] = []): { id: string, name: string }[] | null => {
    if (node.id === targetId) {
        return [...path, { id: node.id, name: node.name }];
    }
    if (node.folders) {
        for (const child of Object.values(node.folders)) {
            const result = findPathToNode(child, targetId, [...path, { id: node.id, name: node.name }]);
            if (result) return result;
        }
    }
    return null;
};

export default function usePhotoProofing(userId: string, linkId: string) {
    const {
        loading, setLoading, setImages, setFolders,
        setIds, setAlbums, currentImageIndex, itemsPerPage,
        setShareLinkData, shareLinkData, categories, setCategories,
        projectId, setProjectId, setSyncedFolders, syncedFolders, syncAndLoadAlbumns
    } = usePhotoProofingStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const selectedAlbum = searchParams.get('selectedAlbum') || 'all';

    const getBreadcrumbs = useCallback(() => {
        const breadcrumbsStr = searchParams.get('breadcrumbs');
        if (breadcrumbsStr) {
            try { return JSON.parse(atob(breadcrumbsStr)); } catch (e) { return []; }
        }
        return [];
    }, [searchParams]);

    const setBreadcrumbs = useCallback((newBreadcrumbs: {id: string, name: string}[]) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (newBreadcrumbs.length > 0) {
                newParams.set('breadcrumbs', btoa(JSON.stringify(newBreadcrumbs)));
            } else {
                newParams.delete('breadcrumbs');
            }
            return newParams;
        }, { replace: true });
    }, [setSearchParams]);

    const breadcrumbsRef = useRef(getBreadcrumbs());
    useEffect(() => {
        breadcrumbsRef.current = getBreadcrumbs();
    }, [getBreadcrumbs]);

    const currentFolderId = searchParams.get('folderId');

    const setCurrentFolderId = useCallback((newFolderId: string | null) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (newFolderId) {
                newParams.set('folderId', newFolderId);
            } else {
                newParams.delete('folderId');
            }
            return newParams;
        }, { replace: true });
    }, [setSearchParams]);

    const currentFolderIdRef = useRef(currentFolderId);
    useEffect(() => {
        currentFolderIdRef.current = currentFolderId;
    }, [currentFolderId]);

    useEffect(() => {
        setIds(userId, linkId);
    }, [userId, linkId, setIds]);
    const [error, setError] = useState<string | null>(null);
    const [projectData, setProjectData] = useState<ProjectJoinDriveData | null>(null);
    // const project: Project | undefined = projectData?.project;
    // const driveData: DriveData | null | undefined = projectData?.driveData;

    // Cache for fetched trees: { [rootFolderId]: treeData }
    const [cachedTrees, setCachedTrees] = useState<{ [key: string]: DriveNode }>({});
    // Map to track which root a folder belongs to: { [folderId]: rootFolderId }
    const [folderRootMap, setFolderRootMap] = useState<{ [key: string]: string }>({});

    const handleLinkShared = useCallback(async () => {
        let initialFolders: DriveNode[] = [];

        let initialBreadcrumbs: { id: string; name: string }[] = [];

        // 2. Handle Share Link if present
        if (linkId) {
            setLoading(true);
            const linkData = (await getSharedLink({
                id: linkId
            }))[0];
            setShareLinkData(linkData);
            setProjectId(linkData.sourceProjectId)
            const projectData = await loadProjectAndLink(linkData.sourceProjectId);

            // albums example
            // "favourites": { name: "Favourites", images: [] }
            const categoriesObj: Record<string, AlbumCategory> = {}
            linkData?.categories?.forEach(e => { categoriesObj[e.id] = { name: e.label, images: [], id: e.id } });
            setCategories(categoriesObj);

            // Find the "roots" of the shared selection from the project's driveData
            if (projectData && projectData!.driveData?.driveData) {
                const sharedRoots = findSharedRoots(projectData.driveData.driveData);
                initialFolders = sharedRoots;
            }

            initialBreadcrumbs = [{ id: 'SHARED_ROOT', name: 'Shared Files' }];

            if (!currentFolderIdRef.current) {
                setCurrentFolderId(null);
                setFolders(initialFolders);
                setBreadcrumbs(initialBreadcrumbs);
                setImages([]);
            }
            setLoading(false);
        }
    }, [linkId, userId]);
    useEffect(() => {
        if (linkId) {
            handleLinkShared();
        }
    }, [linkId])

    const loadProjectAndLink = useCallback(async (projectId: string) => {
        try {
            // 1. Fetch Project Details
            const res = await getProject(userId, projectId);
            if (res.data && res.data.length > 0) {
                const projectData = res.data[0];
                setProjectData(projectData);
                const temp = await getSyncedFolders(projectData.project.id)
                setSyncedFolders(temp)
                return projectData;
            }


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



    const fetchContent = async (project: Project | undefined, driveData: DriveData | null | undefined) => {
        if (!project) return;

        // If linkId is present and currentFolderId is null, we are at the "Shared Root"
        if (!currentFolderId && linkId) return;

        // Handle explicit SHARED_ROOT navigation
        if (currentFolderId === 'SHARED_ROOT') {
            if (linkId && shareLinkData && driveData?.driveData) {
                const includedIds = new Set<string>(shareLinkData.includedFolders || []);
                const sharedRoots = findSharedRoots(driveData.driveData, includedIds);
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
            if (!rootId && project && (project as any)[currentFolderId]) {
                rootId = currentFolderId;
                setFolderRootMap(prev => ({ ...prev, [currentFolderId]: currentFolderId }));
            }

            // Let's try to find the tree data.
            let tree: DriveNode | undefined = cachedTrees[rootId];

            // Fallback: If no tree in cache, try to use project.driveData as the tree
            if (!tree && driveData?.driveData) {
                // Check if the current folder is within driveData
                const foundInDriveData = findNodeById(driveData.driveData, currentFolderId);
                if (foundInDriveData) {
                    tree = driveData.driveData;
                }
            }

            // If we don't have the tree, we need to fetch it.
            if (!tree && rootId && project && project[rootId]) {
                const { filePath } = project[rootId];

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
                const fileCount = syncedFolders[currentFolderId]?.filesCount ?? 0;
                const isFolderSelected = true;
                // shareLinkData?.includedFolders?.includes(currentFolderId);
                if (fileCount && fileCount > 0 && !currentNode.files && isFolderSelected) {
                    const data = await getProjectTreeData(syncedFolders[currentFolderId]?.filePath);
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

                // Reconstruct breadcrumbs if missing/empty but we are deep in structure
                const currentBreadcrumbs = breadcrumbsRef.current;
                if (currentBreadcrumbs.length === 0 || (currentBreadcrumbs.length === 1 && currentBreadcrumbs[0].id === 'SHARED_ROOT' && currentFolderId !== 'SHARED_ROOT')) {
                    if (tree) {
                        const path = findPathToNode(tree, currentFolderId);
                        if (path) {
                            let fullPath = path;
                            if (linkId) {
                                fullPath = [{ id: 'SHARED_ROOT', name: 'Shared Files' }, ...path];
                            }
                            setBreadcrumbs(fullPath);
                        }
                    }
                }
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



    // Effect to fetch content when currentFolderId changes or project/shareLinkData loads
    useEffect(() => {
        if (!currentFolderId && !projectData) return;
        fetchContent(projectData?.project, projectData?.driveData);
    }, [currentFolderId, projectData]);

    // Effect to sync albums on page load
    useEffect(() => {
        if (userId && projectId && linkId && Object.keys(categories).length > 0) {
            syncAndLoadAlbumns();
        }
    }, [userId, projectId, linkId, categories]);


    // cahnge page number if the user changes to the next or previous page through fullscreen autoplay or next button

    useEffect(() => {
        if (currentImageIndex > -1) {
            const newPage = Math.ceil((currentImageIndex + 1) / itemsPerPage);
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set(selectedAlbum + '__page', newPage.toString());
                return newParams;
            });
        }

    }, [currentImageIndex]);

    return {
        loading,
        error,
        shareLinkData,
        projectData,
        syncAndLoadAlbumns
    };
};
