import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Box, CircularProgress, Typography } from '@mui/material';
import GlobalNavbar from '../../../core/components/GlobalNavbar';
import { useConfigStore } from '../../../core/store/ConifgStore';

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
        const baseLogin = location.pathname.includes("private/admin") ? true : false;
        // Redirect to login page but save the current location they were trying to go to
        return <Navigate to={`/login?baseLogin=${baseLogin}`} state={{ from: location }} replace />;
    }

    // Wait for user profile to be fetched at least once
    if (authLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!currentUser.approved) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <Typography variant="h6">Account not approved yet</Typography>
            <Box height={16}></Box>
            <Typography variant="body2">Please contact admin for approval</Typography>
            <Box height={16}></Box>

            <Typography variant="body2">Mail : studio.mizhiv@gmail.com</Typography>
        </Box>
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
