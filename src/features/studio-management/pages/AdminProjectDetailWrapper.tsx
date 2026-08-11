import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudioManagementStore } from '../store/studioManagementStore';
import ProjectDetailView from './ProjectDetailView';
import { useAuthStore } from '../../auth';

/**
 * Wrapper for admin viewing a user's project detail.
 * Sets viewAsUserId in the store so that ProjectDetailView reads the correct user's data,
 * then renders the exact same ProjectDetailView component.
 */
const AdminProjectDetailWrapper: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.currentUser);

    const setViewAsUserId = useStudioManagementStore((state) => state.setViewAsUserId);
    const clearViewAsUserId = useStudioManagementStore((state) => state.clearViewAsUserId);
    const viewAsUserId = useStudioManagementStore((state) => state.viewAsUserId);
    const isAdmin = useAuthStore((state) => state.isAdmin)();

    // Gate: redirect non-admins
    useEffect(() => {
        if (currentUser && !isAdmin) {
            navigate('/private/studio', { replace: true });
        }
    }, [currentUser, navigate]);

    // Set viewAsUserId on mount if not already set (e.g., direct URL navigation)
    useEffect(() => {
        if (!userId || !isAdmin) return;

        // Only set if not already viewing this user
        if (viewAsUserId !== userId) {
            setViewAsUserId(userId);
            // setTimeout(() => {
            //     useStudioManagementStore.getState().fetchProjects();
            // }, 0);
        }

        return () => {
            clearViewAsUserId();
            // setTimeout(() => {
            //     useStudioManagementStore.getState().fetchProjects();
            // }, 0);
        };
    }, [userId, currentUser]);

    if (!isAdmin) return null;

    return <ProjectDetailView />;
};

export default AdminProjectDetailWrapper;
