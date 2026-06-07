import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    alpha,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    Avatar,
    TextField,
    InputAdornment,
    Chip,
    Skeleton,
    IconButton,
    Tooltip,
    Fade,
} from '@mui/material';
import {
    Search as SearchIcon,
    AdminPanelSettings as AdminIcon,
    ArrowBack as ArrowBackIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    CalendarToday as CalendarIcon,
    Shield as ShieldIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useUserStore } from '../../auth';

interface UserListItem {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    isAdmin?: boolean;
    createdAt?: any;
}

const UserCard: React.FC<{ user: UserListItem; onSelect: (uid: string) => void }> = ({ user, onSelect }) => {
    const formattedDate = user.createdAt?.toDate
        ? user.createdAt.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : user.createdAt instanceof Date
            ? user.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            : 'Unknown';

    const initials = user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.[0]?.toUpperCase() || '?';

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                background: (theme) => `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                backdropFilter: 'blur(12px)',
                '&:hover': {
                    transform: 'translateY(-6px) scale(1.01)',
                    boxShadow: (theme) =>
                        `0 16px 40px ${alpha(theme.palette.primary.main, 0.2)}, 0 8px 16px ${alpha(theme.palette.common.black, 0.25)}`,
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                    '& .view-indicator': {
                        opacity: 1,
                        transform: 'translateX(0)',
                    },
                    '& .gradient-accent': {
                        opacity: 1,
                    },
                    '& .user-avatar': {
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.4)',
                    },
                },
            }}
        >
            {/* Gradient accent line at top */}
            <Box
                className="gradient-accent"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                    opacity: 0,
                    transition: 'opacity 0.35s ease',
                }}
            />

            <CardActionArea
                onClick={() => onSelect(user.uid)}
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    p: 0,
                }}
            >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Avatar + Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                        <Avatar
                            className="user-avatar"
                            src={user.photoURL || undefined}
                            sx={{
                                width: 52,
                                height: 52,
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                transition: 'box-shadow 0.3s ease',
                                border: '2px solid',
                                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                            }}
                        >
                            {initials}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                noWrap
                                sx={{ lineHeight: 1.3 }}
                            >
                                {user.name || 'Unnamed User'}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                                <EmailIcon sx={{ fontSize: 12 }} />
                                {user.email}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 0.75, mb: 2, flexWrap: 'wrap' }}>
                        {user.isAdmin && (
                            <Chip
                                icon={<ShieldIcon sx={{ fontSize: '14px !important' }} />}
                                label="Admin"
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    fontSize: '0.7rem',
                                    height: 24,
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                                    color: '#a78bfa',
                                    fontWeight: 600,
                                }}
                                variant="outlined"
                            />
                        )}
                        <Chip
                            icon={<PersonIcon sx={{ fontSize: '14px !important' }} />}
                            label="User"
                            size="small"
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                fontSize: '0.7rem',
                                height: 24,
                                borderColor: (theme) => alpha(theme.palette.divider, 0.2),
                            }}
                        />
                    </Box>

                    {/* Footer: Date + View */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 'auto',
                            pt: 1.5,
                            borderTop: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            <CalendarIcon sx={{ fontSize: 12 }} />
                            {formattedDate}
                        </Typography>
                        <Box
                            className="view-indicator"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                opacity: 0,
                                transform: 'translateX(-8px)',
                                transition: 'all 0.3s ease',
                                color: 'primary.main',
                            }}
                        >
                            <Typography variant="caption" fontWeight={600}>
                                View Dashboard
                            </Typography>
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

const UserCardSkeleton: React.FC = () => (
    <Card
        sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.divider, 0.08),
        }}
    >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Skeleton variant="circular" width={52} height={52} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={24} />
                    <Skeleton variant="text" width="90%" height={18} />
                </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.75, mb: 2 }}>
                <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rounded" width={55} height={24} sx={{ borderRadius: 2 }} />
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    pt: 1.5,
                    borderTop: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                }}
            >
                <Skeleton variant="text" width={80} height={18} />
            </Box>
        </CardContent>
    </Card>
);

const SuperAdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile } = useUserStore();
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Gate: redirect non-admins away
    useEffect(() => {
        if (userProfile && !userProfile.isAdmin) {
            navigate('/private/studio', { replace: true });
        }
    }, [userProfile, navigate]);

    // Fetch all users from Firestore
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const q = query(collection(db, 'user'), orderBy('name', 'asc'));
                const querySnapshot = await getDocs(q);
                const usersData: UserListItem[] = querySnapshot.docs.map((doc) => ({
                    uid: doc.id,
                    ...doc.data(),
                })) as UserListItem[];
                setUsers(usersData);
            } catch (err: any) {
                console.error('Error fetching users:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userProfile?.isAdmin) {
            fetchUsers();
        }
    }, [userProfile]);

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
        navigate(`/private/admin/user/${uid}`);
    };

    // Guard while profile loads
    if (!userProfile?.isAdmin) {
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
                                onClick={() => navigate('/private/studio')}
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
