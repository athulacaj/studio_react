import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { Box, CircularProgress } from '@mui/material';
import UserDetailsModal from './UserDetailsModal';

const ProtectedRoute = () => {
    const { currentUser, loading: authLoading } = useAuthStore();
    const { userProfile, loading: profileLoading, initialized } = useUserStore();
    const location = useLocation();

    // Wait for auth to resolve
    if (authLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!currentUser) {
        // Redirect to login page but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Wait for user profile to be fetched at least once
    if (!initialized || profileLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            {/* Force user to fill name if missing */}
            <UserDetailsModal forcedMode />
            <Outlet />
        </>
    );
};

export default ProtectedRoute;
