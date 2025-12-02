import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../auth';
import { db } from '../../../config/firebase';

const StudioManagementContext = createContext();

export const useStudioManagement = () => {
    return useContext(StudioManagementContext);
};

export const StudioManagementProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

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
            }));
            setProjects(projectsData);
        } catch (err) {
            console.error("Error fetching projects:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const addProject = async (projectData) => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const docRef = await addDoc(collection(db, 'projects', currentUser.uid, 'projects'), {
                ...projectData,
                userId: currentUser.uid,
                createdAt: serverTimestamp(),
                status: 'active'
            });
            // Optimistically add to state or refetch
            const newProject = { id: docRef.id, ...projectData, userId: currentUser.uid, createdAt: new Date(), status: 'active' };
            setProjects(prev => [newProject, ...prev]);
            return docRef.id;
        } catch (err) {
            console.error("Error adding project:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProject = async (projectId, updates) => {
        if (!currentUser) return;
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
        } catch (err) {
            console.error("Error updating project:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createShareLink = async (projectId, linkData) => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const shareLinkRef = await addDoc(collection(db, 'projects', currentUser.uid, 'projects', projectId, 'shared_links'), {
                ...linkData,
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid
            });
            return shareLinkRef.id;
        } catch (err) {
            console.error("Error creating share link:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchShareLinks = async (projectId) => {
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
            }));
        } catch (err) {
            console.error("Error fetching share links:", err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const updateShareLink = async (projectId, linkId, updates) => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const linkRef = doc(db, 'projects', currentUser.uid, 'projects', projectId, 'shared_links', linkId);
            await updateDoc(linkRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error updating share link:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteShareLink = async (projectId, linkId) => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const linkRef = doc(db, 'projects', currentUser.uid, 'projects', projectId, 'shared_links', linkId);
            await deleteDoc(linkRef);
        } catch (err) {
            console.error("Error deleting share link:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
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
