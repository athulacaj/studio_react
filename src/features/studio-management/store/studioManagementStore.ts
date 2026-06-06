import { create } from 'zustand';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useAuthStore } from '../../auth';
import { db } from '../../../config/firebase';
import { Project, SharedLink } from '../types';

const PAGE_LIMIT = 3;

interface StudioManagementState {
    projects: Project[];
    loading: boolean;
    error: string | null;

    // Pagination state
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null;
    pageStartCursors: (QueryDocumentSnapshot<DocumentData> | null)[];

    fetchProjects: () => Promise<void>;
    fetchNextPage: () => Promise<void>;
    fetchPreviousPage: () => Promise<void>;
    addProject: (projectData: Partial<Project>) => Promise<string>;
    updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
    createShareLink: (projectId: string, linkData: Omit<SharedLink, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
    fetchShareLinks: (projectId: string) => Promise<SharedLink[]>;
    updateShareLink: (projectId: string, linkId: string, updates: Partial<SharedLink>) => Promise<void>;
    deleteShareLink: (projectId: string, linkId: string) => Promise<void>;
}

const getCurrentUser = () => useAuthStore.getState().currentUser;

export const useStudioManagementStore = create<StudioManagementState>((set, get) => ({
    projects: [],
    loading: false,
    error: null,

    // Pagination initial state
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    lastVisibleDoc: null,
    pageStartCursors: [null], // index 0 = page 1 cursor (null = start from beginning)

    fetchProjects: async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        set({ loading: true });
        try {
            // Fetch limit + 1 to check if there's a next page
            const q = query(
                collection(db, 'projects', currentUser.uid, 'projects'),
                orderBy('createdAt', 'desc'),
                limit(PAGE_LIMIT + 1)
            );
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs;
            const hasNext = docs.length > PAGE_LIMIT;
            const visibleDocs = hasNext ? docs.slice(0, PAGE_LIMIT) : docs;

            const projectsData = visibleDocs.map(d => ({
                id: d.id,
                ...d.data()
            })) as Project[];

            const lastVisible = visibleDocs.length > 0 ? visibleDocs[visibleDocs.length - 1] : null;

            set({
                projects: projectsData,
                error: null,
                currentPage: 1,
                hasNextPage: hasNext,
                hasPreviousPage: false,
                lastVisibleDoc: lastVisible,
                pageStartCursors: [null], // Reset cursor stack
            });
        } catch (err: any) {
            console.error("Error fetching projects:", err);
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    fetchNextPage: async () => {
        const currentUser = getCurrentUser();
        const { lastVisibleDoc, hasNextPage, currentPage, pageStartCursors } = get();
        if (!currentUser || !hasNextPage || !lastVisibleDoc) return;

        set({ loading: true });
        try {
            const q = query(
                collection(db, 'projects', currentUser.uid, 'projects'),
                orderBy('createdAt', 'desc'),
                startAfter(lastVisibleDoc),
                limit(PAGE_LIMIT + 1)
            );
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs;

            if (docs.length === 0) {
                set({ hasNextPage: false });
                return;
            }

            const hasNext = docs.length > PAGE_LIMIT;
            const visibleDocs = hasNext ? docs.slice(0, PAGE_LIMIT) : docs;

            const projectsData = visibleDocs.map(d => ({
                id: d.id,
                ...d.data()
            })) as Project[];

            const lastVisible = visibleDocs[visibleDocs.length - 1];
            const newPage = currentPage + 1;

            // Store the first doc of this new page as a cursor for navigating back
            const updatedCursors = [...pageStartCursors];
            if (updatedCursors.length <= newPage - 1) {
                updatedCursors.push(lastVisibleDoc);
            }

            set({
                projects: projectsData,
                error: null,
                currentPage: newPage,
                hasNextPage: hasNext,
                hasPreviousPage: true,
                lastVisibleDoc: lastVisible,
                pageStartCursors: updatedCursors,
            });
        } catch (err: any) {
            console.error("Error fetching next page:", err);
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    fetchPreviousPage: async () => {
        const currentUser = getCurrentUser();
        const { currentPage, pageStartCursors } = get();
        if (!currentUser || currentPage <= 1) return;

        set({ loading: true });
        try {
            const prevPage = currentPage - 1;
            const cursor = pageStartCursors[prevPage - 1]; // Get the cursor for the previous page

            const constraints = [
                orderBy('createdAt', 'desc'),
                limit(PAGE_LIMIT + 1),
            ];

            if (cursor) {
                constraints.push(startAfter(cursor));
            }

            const q = query(
                collection(db, 'projects', currentUser.uid, 'projects'),
                ...constraints
            );
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs;
            const hasNext = docs.length > PAGE_LIMIT;
            const visibleDocs = hasNext ? docs.slice(0, PAGE_LIMIT) : docs;

            const projectsData = visibleDocs.map(d => ({
                id: d.id,
                ...d.data()
            })) as Project[];

            const lastVisible = visibleDocs.length > 0 ? visibleDocs[visibleDocs.length - 1] : null;

            set({
                projects: projectsData,
                error: null,
                currentPage: prevPage,
                hasNextPage: hasNext,
                hasPreviousPage: prevPage > 1,
                lastVisibleDoc: lastVisible,
            });
        } catch (err: any) {
            console.error("Error fetching previous page:", err);
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
            // After adding, re-fetch from page 1 to get consistent state
            await get().fetchProjects();
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
        useStudioManagementStore.setState({ projects: [], error: null, currentPage: 1, hasNextPage: false, hasPreviousPage: false, lastVisibleDoc: null, pageStartCursors: [null] });
    }
});
