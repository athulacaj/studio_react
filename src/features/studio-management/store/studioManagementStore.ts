import { create } from 'zustand';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, limit, startAfter, QueryDocumentSnapshot, DocumentData, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../../auth';
import { db } from '../../../config/firebase';
import { Project, ProjectAssets, ProjectJoinDriveData, ProjectStatus, SharedLink, Source } from '../types';
import { createProject, getProject, getSharedLink, postShareLink } from '../api/projectService';
import ApiEndPoints from '../../../config/apiEndpoints';
import { StudioApiClient } from '../../../services/ApiInitalizer';
import { Business } from '../api/businessService';

const PAGE_LIMIT = 3;

interface StudioManagementState {
    projects: ProjectJoinDriveData[];
    loading: boolean;
    error: string | null;
    currentProject: ProjectJoinDriveData | null;

    // Admin view-as-user support
    /** When set, the store operates on this user's data instead of the logged-in user */
    viewAsUserId: string | null;
    setViewAsUserId: (uid: string | null) => void;
    clearViewAsUserId: () => void;

    // Pagination state
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null;
    pageStartCursors: (QueryDocumentSnapshot<DocumentData> | null)[];
    businessData: Business | null;


    fetchProjects: () => Promise<void>;
    fetchNextPage: () => Promise<void>;
    fetchPreviousPage: () => Promise<void>;
    addProject: (projectData: Partial<Project>) => Promise<string>;
    updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
    createShareLink: (projectId: string, linkData: Omit<SharedLink, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
    fetchShareLinks: (projectId: string) => Promise<SharedLink[]>;
    updateShareLink: (projectId: string, linkId: string, updates: Partial<SharedLink>) => Promise<void>;
    deleteShareLink: (projectId: string, linkId: string) => Promise<void>;
    updateProjectLocalState: (projectId: string) => Promise<void>;
    fetchCurrentProject: (projectId: string) => Promise<void>;
    setBusinessData: (data: Business) => void;
    setCurrentProject: (project: ProjectJoinDriveData | null) => void;
    setLoading: (loading: boolean) => void;

}


/**
 * Returns the effective user ID for Firestore queries.
 * If viewAsUserId is set (admin viewing another user), returns that.
 * Otherwise returns the current authenticated user's uid.
 */
const getEffectiveUserId = (): string | null => {
    const viewAsUserId = useAuthStore.getState().currentUser?.userId;
    if (viewAsUserId) return viewAsUserId;
    return null
}

export const useStudioManagementStore = create<StudioManagementState>((set, get) => ({
    projects: [],
    loading: false,
    error: null,
    currentProject: null,
    businessData: null,

    // Admin view-as-user
    viewAsUserId: null,
    setViewAsUserId: (uid: string | null) => {
        set({
            viewAsUserId: uid,
            projects: [],
            error: null,
            currentPage: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            lastVisibleDoc: null,
            pageStartCursors: [null],
        });
    },
    clearViewAsUserId: () => {
        set({
            viewAsUserId: null,
            projects: [],
            error: null,
            currentPage: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            lastVisibleDoc: null,
            pageStartCursors: [null],
        });
    },

    // Pagination initial state
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    lastVisibleDoc: null,
    pageStartCursors: [null], // index 0 = page 1 cursor (null = start from beginning)

    fetchProjects: async () => {
        const effectiveUid = getEffectiveUserId();
        if (!effectiveUid) return;
        set({ loading: true });
        try {
            const projectsData = await getProject(effectiveUid)
            set({
                projects: projectsData.data,
                error: null,
                currentPage: 1,
                hasPreviousPage: false,
                pageStartCursors: [null], // Reset cursor stack
            });
        } catch (err: any) {
            console.error("Error fetching projects:", err);
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },
    fetchCurrentProject: async (projectId: string) => {
        set({ loading: true });
        const projectData = await getProject(undefined, projectId);
        set({ loading: false });
        if (projectData.data[0]) {
            set({
                currentProject: projectData.data[0]
            })
        }
    },


    fetchNextPage: async () => {
        return;
    },

    fetchPreviousPage: async () => {
        return;
    },

    addProject: async (projectData: Partial<Project>) => {
        const effectiveUid = getEffectiveUserId();
        if (!effectiveUid) throw new Error("No user authenticated");
        set({ loading: true });
        try {
            await createProject({
                name: projectData.name ?? '',
                userId: effectiveUid,
                description: projectData.description,
                source: projectData.source ?? Source.GOOGLE_PHOTOS,
                status: projectData.status ?? ProjectStatus.ACTIVE,
                projectAssets: projectData.projectAssets ?? ProjectAssets.GDRIVE,
                driveUrl: projectData.driveUrl
            }, {
                driveData: projectData.driveData ?? {},
                selectedFolders: projectData.selectedFolders,
            })
            return '';
        } catch (err: any) {
            console.error("Error adding project:", err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    updateProject: async (projectId: string, updates: Partial<Project>) => {

        try {
            return;
        } catch (err: any) {
            console.error("Error updating project:", err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ loading: false });
        }
    },
    updateProjectLocalState: async (projectId: string) => {
        const effectiveUid = getEffectiveUserId();

        return
    },

    createShareLink: async (projectId: string, linkData: Omit<SharedLink, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
        const effectiveUid = getEffectiveUserId();
        if (!effectiveUid) throw new Error("No user authenticated");
        set({ loading: true });
        try {
            const shareLinkRef = await postShareLink({
                name: linkData.name,
                sourceProjectId: linkData.sourceProjectId,
                categories: linkData.categories,
                includedFolders: linkData.includedFolders
            })


            return shareLinkRef.id;
        } catch (err: any) {
            console.error("Error creating share link:", err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    fetchShareLinks: async (projectId: string) => {
        const effectiveUid = getEffectiveUserId();
        if (!effectiveUid) return [];
        set({ loading: true });
        try {
            const linkRef = await getSharedLink(
                {
                    createdBy: effectiveUid,
                    sourceProjectId: projectId,
                }
            )
            return linkRef;
        } catch (err: any) {
            console.error("Error fetching share links:", err);
            set({ error: err.message });
            return [];
        } finally {
            set({ loading: false });
        }
    },

    updateShareLink: async (projectId: string, linkId: string, updates: Partial<SharedLink>) => {
        const effectiveUid = getEffectiveUserId();
        if (!effectiveUid) throw new Error("No user authenticated");
        set({ loading: true });
        try {
            const linkRef = doc(db, 'projects', effectiveUid, 'projects', projectId, 'shared_links', linkId);
            await updateDoc(linkRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            const shareLinkRef = await postShareLink({
                name: updates.name,
                sourceProjectId: linkData.sourceProjectId,
                categories: linkData.categories,
                includedFolders: linkData.includedFolders
            })
        } catch (err: any) {
            console.error("Error updating share link:", err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    deleteShareLink: async (projectId: string, linkId: string) => {
        const effectiveUid = getEffectiveUserId();
        if (!effectiveUid) throw new Error("No user authenticated");
        set({ loading: true });
        try {
            const linkRef = doc(db, 'projects', effectiveUid, 'projects', projectId, 'shared_links', linkId);
            await deleteDoc(linkRef);
        } catch (err: any) {
            console.error("Error deleting share link:", err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    setBusinessData: (data: Business) => {
        set({
            businessData: data,
        })
    },

    setCurrentProject: (project: ProjectJoinDriveData | null) => {
        set({
            currentProject: project,
        })
    },

    setLoading: (loading: boolean) => {
        set({
            loading,
        })
    }
}));



