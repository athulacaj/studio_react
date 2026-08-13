import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    alpha,
    Grid,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    Tooltip,
    Fade,
} from '@mui/material';
import {
    Search as SearchIcon,
    AdminPanelSettings as AdminIcon,
    ArrowBack as ArrowBackIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../auth';
import { UserListItem } from '../types';
import UserCard from '../components/UserCard';
import UserCardSkeleton from '../components/UserCardSkeleton';
import { getAllUsers } from '../services/userService';
import { Role } from '../../../types/roles';

const SuperAdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.currentUser);
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const isAdmin = useAuthStore((state) => state.isAdmin)();


    // Gate: redirect non-admins away
    useEffect(() => {
        if (!isAdmin) {
            navigate('/private/studio', { replace: true });
        }
    }, [currentUser, navigate]);

    // Fetch all users from API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAllUsers();
                const mapped: UserListItem[] = data.map((user) => ({
                    uid: user.userId,
                    name: user.name,
                    email: user.email,
                    photoURL: user.photoUrl,
                    isAdmin: user.role === Role.ADMIN,
                }));
                setUsers(mapped);
            } catch (err: any) {
                setError(err?.message || 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin) {
            fetchUsers();
        }
    }, []);

    // Filter users based on search
    const filteredUsers = users.filter((user) => {
        const q = searchQuery.toLowerCase();
        return (
            user.name?.toLowerCase().includes(q) ||
            user.email?.toLowerCase().includes(q) ||
            user.uid?.toLowerCase().includes(q)
        );
    });

    const handleUserSelect = (uid: string) => {
        navigate(`/private/user/${uid}`);
    };

    // Guard while profile loads
    if (!isAdmin) {
        return null;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Fade in timeout={500}>
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Tooltip title="Back to my studio">
                            <IconButton
                                onClick={() => navigate(-1)}
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
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <AdminIcon
                                    sx={{
                                        fontSize: 32,
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                />
                                <Typography variant="h4" fontWeight="bold">
                                    Super Admin
                                </Typography>
                                <Chip
                                    label="Admin Panel"
                                    size="small"
                                    sx={{
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                                        color: '#a78bfa',
                                        fontWeight: 600,
                                        border: '1px solid',
                                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                    }}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, pl: 0.5 }}>
                                Select a user to view their dashboard and projects
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Fade>

            {/* Search + Stats Bar */}
            <Fade in timeout={700}>
                <Paper
                    sx={{
                        p: 2.5,
                        mb: 4,
                        backgroundColor: 'background.paper',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}
                    elevation={0}
                >
                    <TextField
                        placeholder="Search users by name, email, or UID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        sx={{
                            flex: 1,
                            minWidth: 280,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2.5,
                                backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                    borderWidth: 1.5,
                                },
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Chip
                            label={`${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                background: (theme) => alpha(theme.palette.info.main, 0.1),
                                color: 'info.main',
                            }}
                        />
                        <Chip
                            label={`${users.filter((u) => u.isAdmin).length} admin${users.filter((u) => u.isAdmin).length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                                color: '#a78bfa',
                            }}
                        />
                    </Box>
                </Paper>
            </Fade>

            {/* Error */}
            {error && (
                <Paper
                    sx={{
                        p: 2,
                        mb: 3,
                        backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.error.main, 0.3),
                        borderRadius: 2,
                    }}
                    elevation={0}
                >
                    <Typography color="error" variant="body2">
                        Error loading users: {error}
                    </Typography>
                </Paper>
            )}

            {/* Users Grid */}
            <Fade in timeout={900}>
                <Box>
                    {loading ? (
                        <Grid container spacing={3}>
                            {[...Array(6)].map((_, i) => (
                                <Grid item xs={12} sm={6} md={4} key={i}>
                                    <UserCardSkeleton />
                                </Grid>
                            ))}
                        </Grid>
                    ) : filteredUsers.length === 0 ? (
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 8,
                                color: 'text.secondary',
                            }}
                        >
                            <PersonIcon sx={{ fontSize: 56, opacity: 0.2, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                {searchQuery ? 'No users match your search' : 'No users found'}
                            </Typography>
                            <Typography variant="body2">
                                {searchQuery
                                    ? 'Try adjusting your search terms'
                                    : 'There are no registered users yet'}
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredUsers.map((user) => (
                                <Grid item xs={12} sm={6} md={4} key={user.uid}>
                                    <UserCard user={user} onSelect={handleUserSelect} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Fade>
        </Container>
    );
};

export default SuperAdminDashboard;
