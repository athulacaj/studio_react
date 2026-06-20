import { create } from 'zustand';
import { ImageObj, Folder, AlbumCategory } from '../types';
import { db } from '../../../config/firebase';
import { doc, setDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { indexedDBService } from '../services/IndexedDBService';

interface PhotoProofingState {
    // Core IDs
    userId: string | null;
    projectId: string | null;
    linkId: string | null;

    // UI State
    loading: boolean;
    images: ImageObj[];
    folders: Folder[];
    breadcrumbs: { id: string; name: string }[];
    currentImageIndex: number;
    itemsPerPage: number;

    // Albums
    albums: Record<string, string[]>; // this is the saved categories to the album
    categories: Record<string, AlbumCategory>; // this the categories from the db

    selectedAlbum: string;
    toAddWhichAlbum: string | null;

    addToAlbumLoader: boolean;


    // Folder Navigation (synced with URL via useUrlSync hook)
    currentFolderId: string | null;

    // File System Access API handles
    sourceDirectoryHandle: FileSystemDirectoryHandle | null;
    destinationDirectoryHandle: FileSystemDirectoryHandle | null;

    // Image cache
    imagesCache: HTMLImageElement[];

    //Share link data
    shareLinkData: Record<string, any>;
}

interface PhotoProofingActions {
    // Core ID setters
    setIds: (userId: string, projectId: string, linkId?: string | null) => void;

    // UI setters
    setLoading: (loading: boolean) => void;
    setImages: (images: ImageObj[] | ((prev: ImageObj[]) => ImageObj[])) => void;
    setFolders: (folders: Folder[] | ((prev: Folder[]) => Folder[])) => void;
    setBreadcrumbs: (breadcrumbs: { id: string; name: string }[] | ((prev: { id: string; name: string }[]) => { id: string; name: string }[])) => void;
    setCurrentImageIndex: (index: number | ((prev: number) => number)) => void;

    // Album actions
    setAlbums: (albums: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void;
    setToAddWhichAlbum: (album: string | null | ((prev: string | null) => string | null)) => void;
    setCategories: (categories: Record<string, AlbumCategory> | ((prev: Record<string, AlbumCategory>) => Record<string, AlbumCategory>)) => void;
    setSelectedAlbum: (album: string | ((prev: string) => string)) => void;
    handleAlbumChange: (album: AlbumCategory) => void;
    handleAddToAlbum: (albumName: string, image: ImageObj) => void;
    handleRemoveFromAlbum: (albumName: string, image: ImageObj) => void;

    // Folder navigation
    setCurrentFolderId: (folderId: string | null | ((prev: string | null) => string | null)) => void;
    navigateToFolder: (folderId: string | null, folderName: string) => void;

    // File handles
    setSourceDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
    setDestinationDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;

    // Image cache
    setImagesCache: (cache: HTMLImageElement[] | ((prev: HTMLImageElement[]) => HTMLImageElement[])) => void;

    // Share link data
    setShareLinkData: (link: Record<string, any>) => void;

    // Reset
    reset: () => void;
}

export type PhotoProofingStore = PhotoProofingState & PhotoProofingActions;

const initialState: PhotoProofingState = {
    userId: null,
    projectId: null,
    linkId: null,
    loading: true,
    images: [],
    folders: [],
    breadcrumbs: [],
    currentImageIndex: -1,
    itemsPerPage: 8,
    albums: {},
    selectedAlbum: 'all',
    toAddWhichAlbum: localStorage?.getItem('toAddWhichAlbum'),
    categories: {},
    addToAlbumLoader: false,
    currentFolderId: null,
    sourceDirectoryHandle: null,
    destinationDirectoryHandle: null,
    imagesCache: [],
    shareLinkData: {},
};

// Helper to resolve functional updaters (like React's setState callback pattern)
function resolve<T>(valueOrFn: T | ((prev: T) => T), prev: T): T {
    return typeof valueOrFn === 'function' ? (valueOrFn as (prev: T) => T)(prev) : valueOrFn;
}

export const usePhotoProofingStore = create<PhotoProofingStore>((set, get) => ({
    ...initialState,

    // --- Core ID setters ---
    setIds: (userId, projectId, linkId = null) => {
        set({ userId, projectId, linkId });
    },

    // --- UI setters ---
    setLoading: (loading) => set({ loading }),

    setImages: (images) => set((state) => ({
        images: resolve(images, state.images),
    })),

    setFolders: (folders) => set((state) => ({
        folders: resolve(folders, state.folders),
    })),

    setBreadcrumbs: (breadcrumbs) => set((state) => ({
        breadcrumbs: resolve(breadcrumbs, state.breadcrumbs),
    })),

    setCurrentImageIndex: (index) => set((state) => ({
        currentImageIndex: resolve(index, state.currentImageIndex),
    })),

    // --- Album actions ---
    setAlbums: (albums) => set((state) => ({
        albums: resolve(albums, state.albums),
    })),

    setSelectedAlbum: (album) => set((state) => ({
        selectedAlbum: resolve(album, state.selectedAlbum),
    })),
    setCategories: (categories) => set((state) => ({
        categories: resolve(categories, state.categories),
    })),

    handleAlbumChange: (category: AlbumCategory) => {
        set({ selectedAlbum: category.id });
    },
    setToAddWhichAlbum: (album: string | null | ((prev: string | null) => string | null)) => set((state) => {
        localStorage.setItem('toAddWhichAlbum', album as string ?? '');
        return {
            toAddWhichAlbum: resolve(album, state.toAddWhichAlbum),
        }
    }),

    handleAddToAlbum: async (albumName, image) => {
        const { userId, projectId, linkId, breadcrumbs } = get();
        image.folderPathList = breadcrumbs.map((b) => b.name).slice(1);
        if (!image || !image.id) return;

        set({ addToAlbumLoader: true });

        if (userId && projectId && linkId) {
            const photoDocRef = doc(db, 'projects', userId, 'projects', projectId, 'shared_links', linkId, 'albums', image.id);

            try {
                await setDoc(photoDocRef, {
                    selections: arrayUnion(albumName),
                    updatedAt: serverTimestamp(),
                    image: JSON.stringify(image),
                }, { merge: true });

                // Update IndexedDB
                const localImage = await indexedDBService.getImageById(projectId, image.id);
                const updatedSelections = localImage?.selections
                    ? [...new Set([...localImage.selections, albumName])]
                    : [albumName];
                await indexedDBService.insertOrUpdateImage(projectId, {
                    ...localImage,
                    id: image.id,
                    selections: updatedSelections,
                    image: JSON.stringify(image),
                });

                // Update store
                set((state) => {
                    const currentAlbum = state.albums[albumName] || [];
                    // Duplicate check: parse each entry to compare by id
                    const alreadyIn = currentAlbum.some((entry: string) => {
                        try { return JSON.parse(entry).id === image.id; } catch { return entry === image.id; }
                    });
                    if (alreadyIn) return {};

                    return {
                        albums: {
                            ...state.albums,
                            [albumName]: [...currentAlbum, JSON.stringify(image)],
                        },
                        addToAlbumLoader: false,
                    };
                });
            } catch (err) {
                console.error("Error updating photo albums in Firestore:", err);
                set({ addToAlbumLoader: false });
            }
        }
    },

    handleRemoveFromAlbum: async (albumName, image) => {
        const { userId, projectId, linkId } = get();
        if (!image || !image.id) return;

        set({ addToAlbumLoader: true });

        if (userId && projectId && linkId) {
            const photoDocRef = doc(db, 'projects', userId, 'projects', projectId, 'shared_links', linkId, 'albums', image.id);

            try {
                await setDoc(photoDocRef, {
                    selections: arrayRemove(albumName),
                    updatedAt: serverTimestamp(),
                }, { merge: true });

                // Update IndexedDB
                const localImage = await indexedDBService.getImageById(projectId, image.id);
                if (localImage && localImage.selections) {
                    const updatedSelections = localImage.selections.filter((s: string) => s !== albumName);
                    await indexedDBService.insertOrUpdateImage(projectId, {
                        ...localImage,
                        selections: updatedSelections,
                    });
                }

                // Update store
                set((state) => {
                    const currentAlbum = state.albums[albumName] || [];
                    return {
                        albums: {
                            ...state.albums,
                            // Filter by parsing each entry's id — entries are always JSON.stringify(imageObj)
                            [albumName]: currentAlbum.filter((entry: string) => {
                                try { return JSON.parse(entry).id !== image.id; } catch { return entry !== image.id; }
                            }),
                        },
                        addToAlbumLoader: false,
                    };
                });
            } catch (err) {
                console.error("Error updating photo albums in Firestore:", err);
                set({ addToAlbumLoader: false });
            }
        }
    },

    // --- Folder navigation ---
    setCurrentFolderId: (folderId) => set((state) => ({
        currentFolderId: resolve(folderId, state.currentFolderId),
    })),

    navigateToFolder: (folderId, folderName) => {
        set((state) => {
            if (folderId) {
                const index = state.breadcrumbs.findIndex(b => b.id === folderId);
                const newBreadcrumbs = index !== -1
                    ? state.breadcrumbs.slice(0, index + 1)
                    : [...state.breadcrumbs, { id: folderId, name: folderName }];
                return { currentFolderId: folderId, breadcrumbs: newBreadcrumbs };
            } else {
                return { currentFolderId: null, breadcrumbs: [] };
            }
        });
    },

    // --- File handles ---
    setSourceDirectoryHandle: (handle) => set({ sourceDirectoryHandle: handle }),
    setDestinationDirectoryHandle: (handle) => set({ destinationDirectoryHandle: handle }),

    // --- Image cache ---
    setImagesCache: (cache) => set((state) => ({
        imagesCache: resolve(cache, state.imagesCache),
    })),

    // --- Reset ---
    reset: () => set(initialState),
    setShareLinkData: (link: Record<string, any>) => set({ shareLinkData: link }),
}));
