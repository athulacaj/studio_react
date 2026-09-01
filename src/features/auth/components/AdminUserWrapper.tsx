import React, { useEffect, useId, useState } from 'react';
import { Navigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Box, CircularProgress } from '@mui/material';
import GlobalNavbar from '../../../core/components/GlobalNavbar';
import { useConfigStore } from '../../../core/store/ConifgStore';
import { getUserById } from '../../user-management/services/userService';
import { adminSwithUser } from '../services/authService';

const AdminUserWrapper = () => {
    const { currentUser, loading: authLoading, setUser, setEffectiveUserId, setEffectiveUser, effectiveUserId } = useAuthStore();
    const { showNavBar } = useConfigStore();
    const location = useLocation();
    const { userId } = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true)
        if (userId) {
            setEffectiveUserId(userId);
            if (userId != effectiveUserId) {
                adminSwithUser(userId).then(res => {
                    setEffectiveUser(res.user);
                    setLoading(false);
                })
            } else {
                setEffectiveUser(currentUser);
                setLoading(false);
            }
            // setUser(userId).then(()=>{
            //     setLoading(false);
            // });
        } else {
        }
    }, [userId])

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </div>
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
            {/* Force user to fill name if missing */}
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminUserWrapper;
