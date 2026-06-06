import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    Avatar,
    CircularProgress,
    Fade,
    IconButton,
} from '@mui/material';
import { Person as PersonIcon, Close as CloseIcon } from '@mui/icons-material';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';

interface UserDetailsModalProps {
    /** If true, the modal is always open and cannot be dismissed (used for forced onboarding) */
    forcedMode?: boolean;
    /** External open state (used when triggered manually, e.g. from a menu) */
    open?: boolean;
    /** Callback when the modal is closed */
    onClose?: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
    forcedMode = false,
    open: externalOpen,
    onClose,
}) => {
    const { userProfile, loading, saveUserProfile } = useUserStore();
    const { currentUser } = useAuthStore();
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Determine if the modal should be open
    const needsName = forcedMode && (!userProfile?.name || userProfile.name.trim() === '');
    const isOpen = externalOpen ?? needsName;

    // Sync the name field when profile loads
    useEffect(() => {
        if (userProfile?.name) {
            setName(userProfile.name);
        }
    }, [userProfile?.name]);

    const handleSave = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError('Please enter your name');
            return;
        }

        setSaving(true);
        setError('');
        try {
            await saveUserProfile({ name: trimmedName });
            onClose?.();
        } catch (err: any) {
            setError(err.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !saving) {
            handleSave();
        }
    };

    const canDismiss = !forcedMode || (userProfile?.name && userProfile.name.trim() !== '');

    return (
        <Dialog
            open={isOpen}
            onClose={canDismiss ? onClose : undefined}
            maxWidth="xs"
            fullWidth
            TransitionComponent={Fade}
            transitionDuration={350}
            disableEscapeKeyDown={!canDismiss}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)',
                    overflow: 'visible',
                },
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                },
            }}
        >
            {/* Close button — only shown when dismissable */}
            {canDismiss && (
                <IconButton
                    onClick={onClose}
                    aria-label="Close"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'text.secondary',
                        '&:hover': { color: 'text.primary' },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            )}

            {/* Floating Avatar */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: -4,
                }}
            >
                <Avatar
                    src={currentUser?.photoURL || undefined}
                    sx={{
                        width: 72,
                        height: 72,
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        border: '3px solid #1e293b',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
                    }}
                >
                    <PersonIcon sx={{ fontSize: 36 }} />
                </Avatar>
            </Box>

            <DialogTitle
                sx={{
                    textAlign: 'center',
                    pt: 2,
                    pb: 0,
                    fontWeight: 700,
                    fontSize: '1.35rem',
                    letterSpacing: '-0.01em',
                }}
            >
                {forcedMode && needsName ? 'Complete Your Profile' : 'Edit Profile'}
            </DialogTitle>

            <DialogContent sx={{ pt: 1, pb: 0 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 3 }}
                >
                    {forcedMode && needsName
                        ? 'Tell us your name to get started'
                        : 'Update your display name'}
                </Typography>

                {/* Email Display */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 2.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.12)',
                    }}
                >
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        Email
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {currentUser?.email || '—'}
                    </Typography>
                </Box>

                {/* Name Input */}
                <TextField
                    autoFocus
                    fullWidth
                    id="user-details-name"
                    label="Your Name"
                    placeholder="Enter your full name"
                    variant="outlined"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    error={!!error}
                    helperText={error}
                    disabled={saving}
                    slotProps={{
                        inputLabel: { shrink: true },
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                                borderWidth: 2,
                            },
                        },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                {canDismiss && (
                    <Button
                        onClick={onClose}
                        disabled={saving}
                        sx={{
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                        }}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    id="user-details-save-btn"
                    onClick={handleSave}
                    disabled={saving || !name.trim()}
                    variant="contained"
                    sx={{
                        flex: 1,
                        py: 1.2,
                        borderRadius: 2,
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5558e6 0%, #9747e8 100%)',
                            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                        },
                        '&:disabled': {
                            background: 'rgba(99, 102, 241, 0.3)',
                            boxShadow: 'none',
                        },
                    }}
                >
                    {saving ? (
                        <CircularProgress size={22} color="inherit" />
                    ) : (
                        forcedMode && needsName ? 'Get Started' : 'Save'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserDetailsModal;
