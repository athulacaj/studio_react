import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../auth';
import { useStudioManagementStore } from '../store/studioManagementStore';
import ProjectDetailView from './ProjectDetailView';

/**
 * Wrapper for admin viewing a user's project detail.
 * Sets viewAsUserId in the store so that ProjectDetailView reads the correct user's data,
 * then renders the exact same ProjectDetailView component.
 */
const AdminProjectDetailWrapper: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { userProfile } = useUserStore();
    const setViewAsUserId = useStudioManagementStore((state) => state.setViewAsUserId);
    const clearViewAsUserId = useStudioManagementStore((state) => state.clearViewAsUserId);
    const viewAsUserId = useStudioManagementStore((state) => state.viewAsUserId);
    const fetchProjects = useStudioManagementStore((state) => state.fetchProjects);

    // Gate: redirect non-admins
    useEffect(() => {
        if (userProfile && !userProfile.isAdmin) {
            navigate('/private/studio', { replace: true });
        }
    }, [userProfile, navigate]);

    // Set viewAsUserId on mount if not already set (e.g., direct URL navigation)
    useEffect(() => {
        if (!userId || !userProfile?.isAdmin) return;

        // Only set if not already viewing this user
        if (viewAsUserId !== userId) {
            setViewAsUserId(userId);
            setTimeout(() => {
                useStudioManagementStore.getState().fetchProjects();
            }, 0);
        }

        return () => {
            clearViewAsUserId();
            setTimeout(() => {
                useStudioManagementStore.getState().fetchProjects();
            }, 0);
        };
    }, [userId, userProfile]);

    if (!userProfile?.isAdmin) return null;

    return <ProjectDetailView />;
};

export default AdminProjectDetailWrapper;
