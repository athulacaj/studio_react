import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    alpha,
    Avatar,
    Typography,
    Chip,
    Skeleton,
    IconButton,
    Tooltip,
    Fade,
    Container,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Shield as ShieldIcon,
} from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useStudioManagementStore } from '../../studio-management';
import { StudioDashboard } from '../../studio-management';
import { useAuthStore } from '../../auth';
import { UserListItem } from '../types';
import { Role } from '../../../types/roles';

const AdminUserView: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { currentUser, isAdmin, effectiveUser } = useAuthStore()


    const [viewedUser, setViewedUser] = useState<UserListItem | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);









    const userInitials = viewedUser?.name
        ? viewedUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : viewedUser?.email?.[0]?.toUpperCase() || '?';

    return (
        <>
            {/* Admin banner with user info */}
            {
                isAdmin() &&
                <Container maxWidth="lg" sx={{ pt: 4, pb: 0, display: "flex" }}>
                    {/* Back Navigation */}
                    <Fade in timeout={400}>
                        <Box sx={{ mb: 2 }}>
                            <Tooltip title="Back to users list">
                                <IconButton
                                    onClick={() => navigate('/private/admin')}
                                    sx={{
                                        background: (theme) => alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': {
                                            background: (theme) => alpha(theme.palette.primary.main, 0.2),
                                        },
                                    }}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Fade>

                    {/* User Profile Banner */}
                    <Fade in timeout={600}>
                        <Paper
                            sx={{
                                p: 3,
                                mb: 0,
                                backgroundColor: 'background.paper',
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            elevation={0}
                        >
                            {/* Gradient top bar */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 4,
                                    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                                }}
                            />

                            {effectiveUser ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
                                    <Avatar
                                        src={effectiveUser.photoUrl || undefined}
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                            fontSize: '1.2rem',
                                            fontWeight: 700,
                                            border: '3px solid',
                                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                                            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
                                        }}
                                    >
                                        {userInitials}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 150 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.25 }}>
                                            <Typography variant="h6" fontWeight={700}>
                                                {effectiveUser.name || 'Unnamed User'}
                                            </Typography>
                                            {effectiveUser.role == Role.ADMIN && (
                                                <Chip
                                                    icon={<ShieldIcon sx={{ fontSize: '14px !important' }} />}
                                                    label="Admin"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 2,
                                                        fontSize: '0.7rem',
                                                        height: 24,
                                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                                                        color: '#a78bfa',
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            )}
                                            <Chip
                                                label="Viewing as Admin"
                                                size="small"
                                                sx={{
                                                    borderRadius: 2,
                                                    fontSize: '0.65rem',
                                                    height: 22,
                                                    background: (theme) => alpha(theme.palette.warning.main, 0.1),
                                                    color: 'warning.main',
                                                    fontWeight: 600,
                                                    border: '1px solid',
                                                    borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                        >
                                            <EmailIcon sx={{ fontSize: 14 }} />
                                            {effectiveUser.email}
                                            <Typography
                                                component="span"
                                                variant="caption"
                                                sx={{ ml: 1.5, opacity: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
                                            >
                                                <PersonIcon sx={{ fontSize: 12 }} />
                                                {effectiveUser.userId}
                                            </Typography>
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">User not found</Typography>
                            )}
                        </Paper>
                    </Fade>
                </Container>
            }

            {/* Render the exact same StudioDashboard the user sees */}
            <StudioDashboard />
        </>
    );
};

export default AdminUserView;
