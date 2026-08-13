import React, { useEffect, useId, useState } from 'react';
import { Navigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Box, CircularProgress } from '@mui/material';
import GlobalNavbar from '../../../core/components/GlobalNavbar';
import { useConfigStore } from '../../../core/store/ConifgStore';
import { getUserById } from '../../user-management/services/userService';

const AdminUserWrapper = () => {
    const { currentUser, loading: authLoading, setUser, setEffectiveUserId, setEffectiveUser } = useAuthStore();
    const { showNavBar } = useConfigStore();
    const location = useLocation();
    const { userId } = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            setEffectiveUserId(userId);
            if (userId != currentUser?.userId) {
                getUserById(userId).then(res => {
                    setEffectiveUser(res);
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
        return <div>loading user data ...</div>
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
