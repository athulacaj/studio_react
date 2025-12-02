import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
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

    const value = {
        projects,
        loading,
        error,
        addProject,
        fetchProjects
    };

    return (
        <StudioManagementContext.Provider value={value}>
            {children}
        </StudioManagementContext.Provider>
    );
};
