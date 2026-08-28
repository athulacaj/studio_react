import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    alpha,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    Tooltip,
    Fade,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Skeleton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    CircularProgress,
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
    Add as AddIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../auth';
import { UserListItem } from '../types';
import { getAllUsers, createUser, updateUser } from '../services/userService';
import { Role } from '../../../types/roles';
import { useToastStore } from '../../../shared/hooks/useToastStore';

const SuperAdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.currentUser);
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const isAdmin = useAuthStore((state) => state.isAdmin)();

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

    // Form fields state
    const [formEmail, setFormEmail] = useState('');
    const [formName, setFormName] = useState('');
    const [formRole, setFormRole] = useState<'Admin' | 'User' | 'Studio'>('User');
    const [formApproved, setFormApproved] = useState(true);
    const [formPassword, setFormPassword] = useState('');

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const showToast = useToastStore((state) => state.showToast);

    // Fetch all users from API
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
                role: user.role,
                approved: !!user.approved,
            }));
            setUsers(mapped);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    // Gate: redirect non-admins away
    useEffect(() => {
        if (!isAdmin) {
            navigate('/private/studio', { replace: true });
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, []);

    const handleOpenAddDialog = () => {
        setDialogMode('add');
        setSelectedUser(null);
        setFormEmail('');
        setFormName('');
        setFormRole('User');
        setFormApproved(true);
        setFormPassword('');
        setFormError(null);
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (user: UserListItem) => {
        setDialogMode('edit');
        setSelectedUser(user);
        setFormEmail(user.email || '');
        setFormName(user.name || '');
        setFormRole(user.role === 'Admin' ? 'Admin' : 'User');
        setFormApproved(user.approved !== false);
        setFormPassword('');
        setFormError(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        if (saving) return;
        setOpenDialog(false);
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formEmail) {
            setFormError('Email is required');
            return;
        }

        try {
            setSaving(true);
            setFormError(null);

            if (dialogMode === 'add') {
                await createUser({
                    email: formEmail,
                    name: formName || undefined,
                    role: formRole,
                    approved: formApproved,
                    password: formPassword || undefined,
                });
                showToast('User created successfully', 'success');
            } else {
                if (!selectedUser?.uid) {
                    throw new Error('No user selected for update');
                }
                await updateUser(selectedUser.uid, {
                    email: formEmail || undefined,
                    name: formName || undefined,
                    role: formRole,
                    approved: formApproved,
                    password: formPassword || undefined,
                });
                showToast('User updated successfully', 'success');
            }

            setOpenDialog(false);
            fetchUsers();
        } catch (err: any) {
            setFormError(err?.response?.data?.message || err?.message || 'An error occurred while saving the user');
        } finally {
            setSaving(false);
        }
    };

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
        navigate(`/private/studio/${uid}`);
    };

    // Guard while profile loads
    if (!isAdmin) {
        return null;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Fade in timeout={500}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                        sx={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            fontWeight: 600,
                            borderRadius: 2.5,
                            textTransform: 'none',
                            px: 3,
                            py: 1,
                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
                            },
                        }}
                    >
                        Add User
                    </Button>
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

            {/* Users Table */}
            <Fade in timeout={900}>
                <Box>
                    {loading ? (
                        <TableContainer
                            component={Paper}
                            sx={{
                                background: (theme) => alpha(theme.palette.background.paper, 0.6),
                                backdropFilter: 'blur(12px)',
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                                overflow: 'hidden',
                            }}
                            elevation={0}
                        >
                            <Table>
                                <TableHead sx={{ background: (theme) => alpha(theme.palette.background.default, 0.5) }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>User</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>Role</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>Joined</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {[...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Skeleton variant="circular" width={40} height={40} />
                                                    <Box>
                                                        <Skeleton variant="text" width={120} height={20} />
                                                        <Skeleton variant="text" width={180} height={14} />
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
                                                <Skeleton variant="text" width={150} height={20} />
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
                                                <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 2 }} />
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
                                                <Skeleton variant="text" width={80} height={20} />
                                            </TableCell>
                                            <TableCell align="right" sx={{ borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
                                                <Skeleton variant="circular" width={32} height={32} sx={{ display: 'inline-block' }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
                        <TableContainer
                            component={Paper}
                            sx={{
                                background: (theme) => `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                                backdropFilter: 'blur(12px)',
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                                overflow: 'hidden',
                                boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
                            }}
                            elevation={0}
                        >
                            <Table>
                                <TableHead sx={{ background: (theme) => alpha(theme.palette.background.default, 0.5) }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 2, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>User</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 2, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 2, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>Role</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 2, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>Joined</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', py: 2, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredUsers.map((user) => {
                                        const initials = user.name
                                            ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                                            : user.email?.[0]?.toUpperCase() || '?';

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

                                        return (
                                            <TableRow
                                                key={user.uid}
                                                hover
                                                onClick={() => handleUserSelect(user.uid)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: (theme) => `${alpha(theme.palette.primary.main, 0.04)} !important`,
                                                    },
                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                }}
                                            >
                                                <TableCell sx={{ py: 1.5, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar
                                                            src={user.photoURL || undefined}
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                                                fontSize: '0.9rem',
                                                                fontWeight: 700,
                                                                border: '2px solid',
                                                                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                                            }}
                                                        >
                                                            {initials}
                                                        </Avatar>
                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography variant="body2" fontWeight={600} noWrap>
                                                                {user.name || 'Unnamed User'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <PersonIcon sx={{ fontSize: 12, opacity: 0.5 }} />
                                                                {user.uid}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <EmailIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                                                        {user.email}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
                                                    {user.isAdmin ? (
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
                                                    ) : (
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
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CalendarIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                                                        {formattedDate}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ py: 1.5, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
                                                    <Tooltip title="Edit User">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenEditDialog(user);
                                                            }}
                                                            sx={{
                                                                color: 'text.secondary',
                                                                mr: 1,
                                                                '&:hover': {
                                                                    background: (theme) => alpha(theme.palette.divider, 0.1),
                                                                    color: 'primary.main',
                                                                },
                                                            }}
                                                        >
                                                            <EditIcon sx={{ fontSize: 20 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="View User Dashboard">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUserSelect(user.uid);
                                                            }}
                                                            sx={{
                                                                color: 'primary.main',
                                                                '&:hover': {
                                                                    background: (theme) => alpha(theme.palette.primary.main, 0.1),
                                                                },
                                                            }}
                                                        >
                                                            <VisibilityIcon sx={{ fontSize: 20 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Fade>

            {/* Add/Edit User Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        background: (theme) => alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(12px)',
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                        borderRadius: 3,
                        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
                    },
                }}
            >
                <form onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                        {dialogMode === 'add' ? 'Add New User' : 'Edit User'}
                    </DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
                        {formError && (
                            <Paper
                                sx={{
                                    p: 1.5,
                                    backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                                    border: '1px solid',
                                    borderColor: (theme) => alpha(theme.palette.error.main, 0.3),
                                    borderRadius: 2,
                                }}
                                elevation={0}
                            >
                                <Typography color="error" variant="caption">
                                    {formError}
                                </Typography>
                            </Paper>
                        )}
                        <TextField
                            label="Email Address"
                            type="email"
                            fullWidth
                            size="small"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            required
                            disabled={saving}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                            }}
                        />
                        <TextField
                            label="Full Name"
                            type="text"
                            fullWidth
                            size="small"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            disabled={saving}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                            }}
                        />
                        <FormControl fullWidth size="small">
                            <InputLabel id="role-select-label">Role</InputLabel>
                            <Select
                                labelId="role-select-label"
                                label="Role"
                                value={formRole}
                                onChange={(e) => setFormRole(e.target.value as 'Admin' | 'User' | 'Studio')}
                                disabled={saving}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="User">User</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Studio">Studio</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formApproved}
                                    onChange={(e) => setFormApproved(e.target.checked)}
                                    color="primary"
                                    disabled={saving}
                                />
                            }
                            label={
                                <Typography variant="body2" color="text.secondary">
                                    Approved / Active
                                </Typography>
                            }
                        />
                        <TextField
                            label={dialogMode === 'add' ? 'Password' : 'New Password'}
                            type="password"
                            fullWidth
                            size="small"
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            disabled={saving}
                            helperText={
                                dialogMode === 'add'
                                    ? 'Optional - sets password for local account login'
                                    : 'Leave blank to keep current password'
                            }
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                        <Button
                            onClick={handleCloseDialog}
                            disabled={saving}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={saving}
                            sx={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                minWidth: 100,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                                },
                            }}
                        >
                            {saving ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : dialogMode === 'add' ? (
                                'Create'
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default SuperAdminDashboard;
