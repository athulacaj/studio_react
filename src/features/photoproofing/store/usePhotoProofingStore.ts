import { create } from 'zustand';
import { ImageObj, Folder, AlbumCategory } from '../types';
import { indexedDBService } from '../services/IndexedDBService';
import { postSelectedAlbum, putSelectedAlbum } from '../../studio-management/api/projectService';
import { albumSyncService } from '../services/AlbumSyncService';

interface PhotoProofingState {
    // Core IDs
    userId: string | null;
    projectId: string | null;
    linkId: string | null;

    // UI State
    loading: boolean;
    images: ImageObj[];
    folders: Folder[];
    currentImageIndex: number;
    itemsPerPage: number;

    // Albums
    albums: Record<string, ImageObj[]>; // this is the saved categories to the album
    categories: Record<string, AlbumCategory>; // this the categories from the db
    toAddWhichAlbum: string | null;

    addToAlbumLoader: boolean;


    // File System Access API handles
    sourceDirectoryHandle: FileSystemDirectoryHandle | null;
    destinationDirectoryHandle: FileSystemDirectoryHandle | null;

    // Image cache
    imagesCache: HTMLImageElement[];

    //Share link data
    shareLinkData: Record<string, any>;
    syncedFolders: Record<string, any>;


}

interface PhotoProofingActions {
    // Core ID setters
    setProjectId: (projectId: string) => void;
    setIds: (linkId?: string | null) => void;

    // UI setters
    setLoading: (loading: boolean) => void;
    setImages: (images: ImageObj[] | ((prev: ImageObj[]) => ImageObj[])) => void;
    setFolders: (folders: Folder[] | ((prev: Folder[]) => Folder[])) => void;
    setCurrentImageIndex: (index: number | ((prev: number) => number)) => void;

    // Album actions
    syncAndLoadAlbumns: () => Promise<void>;
    setToAddWhichAlbum: (album: string | null | ((prev: string | null) => string | null)) => void;
    setCategories: (categories: Record<string, AlbumCategory> | ((prev: Record<string, AlbumCategory>) => Record<string, AlbumCategory>)) => void;
    handleAddToAlbum: (albumName: string, image: ImageObj, breadcrumbs: { id: string, name: string }[]) => Promise<boolean>;
    handleRemoveFromAlbum: (albumName: string, image: ImageObj) => Promise<boolean>;

    // File handles
    setSourceDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
    setDestinationDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;

    // Image cache
    setImagesCache: (cache: HTMLImageElement[] | ((prev: HTMLImageElement[]) => HTMLImageElement[])) => void;

    // Share link data
    setShareLinkData: (link: Record<string, any>) => void;

    // Reset
    reset: () => void;
    setSyncedFolders: (folders: Record<string, any>) => void;
}

export type PhotoProofingStore = PhotoProofingState & PhotoProofingActions;

const initialState: PhotoProofingState = {
    userId: null,
    projectId: null,
    linkId: null,
    loading: true,
    images: [],
    folders: [],
    currentImageIndex: -1,
    itemsPerPage: 8,
    albums: {},
    toAddWhichAlbum: '',
    categories: {},
    addToAlbumLoader: false,
    sourceDirectoryHandle: null,
    destinationDirectoryHandle: null,
    imagesCache: [],
    shareLinkData: {},
    syncedFolders: {}
};

// Helper to resolve functional updaters (like React's setState callback pattern)
function resolve<T>(valueOrFn: T | ((prev: T) => T), prev: T): T {
    return typeof valueOrFn === 'function' ? (valueOrFn as (prev: T) => T)(prev) : valueOrFn;
}


function addOrRemoveFromSelection(state: PhotoProofingState, albumName: string, image: ImageObj, isAdd: boolean = true) {
    const currentAlbum: ImageObj[] = state.albums[albumName] || [];
    // Duplicate check: parse each entry to compare by id
    if (isAdd) {
        const alreadyIn = currentAlbum.some((entry) => entry.id === image.id);
        if (alreadyIn) return {};

        return {
            albums: {
                ...state.albums,
                [albumName]: [...currentAlbum, image],
            },
            addToAlbumLoader: false,
        };
    } else {
        const updatedAlbum = currentAlbum.filter((entry: ImageObj) => {
            return entry.id !== image.id;
        });
        if (updatedAlbum.length === currentAlbum.length) return {};

        return {
            albums: {
                ...state.albums,
                [albumName]: updatedAlbum,
            },
            addToAlbumLoader: false,
        };
    }

}


export const usePhotoProofingStore = create<PhotoProofingStore>((set, get) => ({
    ...initialState,

    setProjectId: (projectId: string) => {
        set({ projectId });
    },
    // --- Core ID setters ---
    setIds: (userId, linkId = null) => {
        set({ userId, linkId });
    },

    // --- UI setters ---
    setLoading: (loading) => set({ loading }),

    setImages: (images) => set((state) => ({
        images: resolve(images, state.images),
    })),

    setFolders: (folders) => set((state) => ({
        folders: resolve(folders, state.folders),
    })),

    setCategories: (categories) => set((state) => ({
        categories: resolve(categories, state.categories),
    })),

    setCurrentImageIndex: (index) => set((state) => ({
        currentImageIndex: resolve(index, state.currentImageIndex),
    })),
    setToAddWhichAlbum: (album: string | null | ((prev: string | null) => string | null)) => set((state) => {
        localStorage.setItem('toAddWhichAlbum', album as string ?? '');
        return {
            toAddWhichAlbum: resolve(album, state.toAddWhichAlbum),
        }
    }),
    syncAndLoadAlbumns: async () => {
        const { userId, projectId, linkId, categories } = get();
        if (!userId || !projectId || !linkId) {
            console.error("Failed to sync albums: Missing userId, projectId, or linkId");
            return;
        };
        try {
            await albumSyncService.syncAlbums(userId, projectId, linkId);

            // After sync, load everything from local cache to state
            const localAlbums: Record<string, ImageObj[]> = await albumSyncService.getAggregatedAlbums(userId, projectId, linkId, categories);
            console.log('localAlbums', localAlbums);
            set({ albums: localAlbums });
        } catch (error) {
            console.error("Failed to sync albums:", error);
        }
    },

    handleAddToAlbum: async (albumName, image, breadcrumbs = []) => {
        const { userId, projectId, linkId } = get();
        image.folderPathList = breadcrumbs.map((b) => b.name).slice(1);
        if (!image || !image.id) return false;


        set({ addToAlbumLoader: true });


        if (userId && projectId && linkId) {

            try {
                const payload = {
                    name: albumName,
                    imageId: image.id,
                    sharedLinkId: linkId!,
                    folderPathList: image.folderPathList,
                    source: image.source,
                    src: image.src,
                    url: image.url,
                    selections: [albumName],
                };
                // Update store
                set((state) => {
                    return addOrRemoveFromSelection(state, albumName, image, true);
                });
                try {
                    await postSelectedAlbum(payload);
                    return true
                } catch (e) {
                    set((state) => {
                        return addOrRemoveFromSelection(state, albumName, image, false);
                    });
                }

            } catch (err) {
                console.error("Error updating photo albums ", err);
                set({ addToAlbumLoader: false });
            }
        }
        return false;
    },

    handleRemoveFromAlbum: async (albumName, image) => {
        const { userId, projectId, linkId } = get();
        if (!image || !image.id) return false;

        set({ addToAlbumLoader: true });

        if (userId && projectId && linkId) {
            set((state) => {
                return addOrRemoveFromSelection(state, albumName, image, false);
            });

            try {
                await putSelectedAlbum({
                    action: 'remove',
                    value: albumName,
                    imageId: image.id,
                    sharedLinkId: linkId
                })

                // Update store
                set((state) => {
                    return addOrRemoveFromSelection(state, albumName, image, false);
                });
                return true;
            } catch (err) {
                set((state) => {
                    return addOrRemoveFromSelection(state, albumName, image, false);
                });
                console.error("Error updating photo albums", err);
                set({ addToAlbumLoader: false });
                return false;
            }
        }
        return false;
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
    setSyncedFolders: (folders: Record<string, any>) => set({ syncedFolders: folders }),
}));
