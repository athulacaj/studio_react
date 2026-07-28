import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Box, CircularProgress } from '@mui/material';
import GlobalNavbar from '../../../core/components/GlobalNavbar';
import { useConfigStore } from '../../../core/store/ConifgStore';
import { getMe } from '../services/userService';

const ProtectedRoute = () => {
    const { currentUser, loading: authLoading, setUser } = useAuthStore();
    const { showNavBar } = useConfigStore();
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
    if (authLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
            {
                showNavBar &&
                <GlobalNavbar />
            }
            {/* Force user to fill name if missing */}
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default ProtectedRoute;
