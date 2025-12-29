import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../auth';
import { db } from '../../../config/firebase';
import { Project, SharedLink } from '../types';

interface StudioManagementContextType {
    projects: Project[];
    loading: boolean;
    error: string | null;
    addProject: (projectData: Partial<Project>) => Promise<string>;
    updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
    createShareLink: (projectId: string, linkData: Omit<SharedLink, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
    fetchShareLinks: (projectId: string) => Promise<SharedLink[]>;
    updateShareLink: (projectId: string, linkId: string, updates: Partial<SharedLink>) => Promise<void>;
    deleteShareLink: (projectId: string, linkId: string) => Promise<void>;
    fetchProjects: () => Promise<void>;
}

const StudioManagementContext = createContext<StudioManagementContextType | undefined>(undefined);

export const useStudioManagement = () => {
    const context = useContext(StudioManagementContext);
    if (!context) {
        throw new Error('useStudioManagement must be used within a StudioManagementProvider');
    }
    return context;
};

interface ProviderProps {
    children: ReactNode;
}

export const StudioManagementProvider: React.FC<ProviderProps> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const auth = useAuth();
    const currentUser = auth?.currentUser;

    const fetchProjects = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, 'projects', currentUser.uid, 'projects'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const projectsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Project[];
            setProjects(projectsData);
        } catch (err: any) {
            console.error("Error fetching projects:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const addProject = async (projectData: Partial<Project>) => {
        if (!currentUser) throw new Error("No user authenticated");
        setLoading(true);
        try {
            const docRef = await addDoc(collection(db, 'projects', currentUser.uid, 'projects'), {
                ...projectData,
                userId: currentUser.uid,
                createdAt: serverTimestamp(),
                status: 'active'
            });
            // Optimistically add to state or refetch
            const newProject = {
                id: docRef.id,
                ...projectData,
                userId: currentUser.uid,
                createdAt: new Date(),
                status: 'active'
            } as Project;
            setProjects(prev => [newProject, ...prev]);
            return docRef.id;
        } catch (err: any) {
            console.error("Error adding project:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProject = async (projectId: string, updates: Partial<Project>) => {
        if (!currentUser) throw new Error("No user authenticated");
        setLoading(true);
        try {
            const projectRef = doc(db, 'projects', currentUser.uid, 'projects', projectId);
            await updateDoc(projectRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });

            // Update local state
            setProjects(prev => prev.map(p =>
                p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
            ));
        } catch (err: any) {
            console.error("Error updating project:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createShareLink = async (projectId: string, linkData: Omit<SharedLink, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
        if (!currentUser) throw new Error("No user authenticated");
        setLoading(true);
        try {
            const shareLinkRef = await addDoc(collection(db, 'projects', currentUser.uid, 'projects', projectId, 'shared_links'), {
                ...linkData,
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid
            });
            return shareLinkRef.id;
        } catch (err: any) {
            console.error("Error creating share link:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchShareLinks = async (projectId: string) => {
        if (!currentUser) return [];
        setLoading(true);
        try {
            const q = query(
                collection(db, 'projects', currentUser.uid, 'projects', projectId, 'shared_links'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SharedLink[];
        } catch (err: any) {
            console.error("Error fetching share links:", err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const updateShareLink = async (projectId: string, linkId: string, updates: Partial<SharedLink>) => {
        if (!currentUser) throw new Error("No user authenticated");
        setLoading(true);
        try {
            const linkRef = doc(db, 'projects', currentUser.uid, 'projects', projectId, 'shared_links', linkId);
            await updateDoc(linkRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (err: any) {
            console.error("Error updating share link:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteShareLink = async (projectId: string, linkId: string) => {
        if (!currentUser) throw new Error("No user authenticated");
        setLoading(true);
        try {
            const linkRef = doc(db, 'projects', currentUser.uid, 'projects', projectId, 'shared_links', linkId);
            await deleteDoc(linkRef);
        } catch (err: any) {
            console.error("Error deleting share link:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value: StudioManagementContextType = {
        projects,
        loading,
        error,
        addProject,
        updateProject,
        createShareLink,
        fetchShareLinks,
        updateShareLink,
        deleteShareLink,
        fetchProjects
    };

    return (
        <StudioManagementContext.Provider value={value}>
            {children}
        </StudioManagementContext.Provider>
    );
};
