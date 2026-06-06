import { create } from 'zustand';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuthStore } from '../../auth';
import { db } from '../../../config/firebase';
import { Project, SharedLink } from '../types';

interface StudioManagementState {
    projects: Project[];
    loading: boolean;
    error: string | null;
    fetchProjects: () => Promise<void>;
    addProject: (projectData: Partial<Project>) => Promise<string>;
    updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
    createShareLink: (projectId: string, linkData: Omit<SharedLink, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
    fetchShareLinks: (projectId: string) => Promise<SharedLink[]>;
    updateShareLink: (projectId: string, linkId: string, updates: Partial<SharedLink>) => Promise<void>;
    deleteShareLink: (projectId: string, linkId: string) => Promise<void>;
}

const getCurrentUser = () => useAuthStore.getState().currentUser;

export const useStudioManagementStore = create<StudioManagementState>((set) => ({
    projects: [],
    loading: false,
    error: null,

    fetchProjects: async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        set({ loading: true });
        try {
            const q = query(
                collection(db, 'projects', currentUser.uid, 'projects'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const projectsData = querySnapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            })) as Project[];
            set({ projects: projectsData, error: null });
        } catch (err: any) {
            console.error("Error fetching projects:", err);
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    addProject: async (projectData: Partial<Project>) => {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error("No user authenticated");
        set({ loading: true });
        try {
            const docRef = await addDoc(collection(db, 'projects', currentUser.uid, 'projects'), {
                ...projectData,
                userId: currentUser.uid,
                createdAt: serverTimestamp(),
                status: 'active'
            });
            // Optimistically add to state
            const newProject = {
                id: docRef.id,
                ...projectData,
                userId: currentUser.uid,
                createdAt: new Date(),
                status: 'active'
            } as Project;
            set((state) => ({ projects: [newProject, ...state.projects], error: null }));
            return docRef.id;
        } catch (err: any) {
            console.error("Error adding project:", err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    updateProject: async (projectId: string, updates: Partial<Project>) => {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error("No user authenticated");
        set({ loading: true });
        try {
            const projectRef = doc(db, 'projects', currentUser.uid, 'projects', projectId);
            await updateDoc(projectRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            // Update local state
            set((state) => ({
                projects: state.projects.map(p =>
                    p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
                ),
                error: null
            }));
        } catch (err: any) {
            console.error("Error updating project:", err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    createShareLink: async (projectId: string, linkData: Omit<SharedLink, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error("No user authenticated");
        set({ loading: true });
        try {
            const shareLinkRef = await addDoc(collection(db, 'projects', currentUser.uid, 'projects', projectId, 'shared_links'), {
                ...linkData,
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid
            });
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
        const currentUser = getCurrentUser();
        if (!currentUser) return [];
        set({ loading: true });
        try {
            const q = query(
                collection(db, 'projects', currentUser.uid, 'projects', projectId, 'shared_links'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            })) as SharedLink[];
        } catch (err: any) {
            console.error("Error fetching share links:", err);
            set({ error: err.message });
            return [];
        } finally {
            set({ loading: false });
        }
    },

    updateShareLink: async (projectId: string, linkId: string, updates: Partial<SharedLink>) => {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error("No user authenticated");
        set({ loading: true });
        try {
            const linkRef = doc(db, 'projects', currentUser.uid, 'projects', projectId, 'shared_links', linkId);
            await updateDoc(linkRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (err: any) {
            console.error("Error updating share link:", err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    deleteShareLink: async (projectId: string, linkId: string) => {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error("No user authenticated");
        set({ loading: true });
        try {
            const linkRef = doc(db, 'projects', currentUser.uid, 'projects', projectId, 'shared_links', linkId);
            await deleteDoc(linkRef);
        } catch (err: any) {
            console.error("Error deleting share link:", err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ loading: false });
        }
    },
}));

// Subscribe to auth changes: auto-fetch projects when user logs in, clear on logout
useAuthStore.subscribe((state, prevState) => {
    if (state.currentUser && state.currentUser !== prevState.currentUser) {
        useStudioManagementStore.getState().fetchProjects();
    }
    if (!state.currentUser && prevState.currentUser) {
        useStudioManagementStore.setState({ projects: [], error: null });
    }
});
