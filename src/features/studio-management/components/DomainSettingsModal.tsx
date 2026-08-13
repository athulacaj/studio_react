import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { createBusiness, getBusiness, getBusinessByUserId } from '../api/businessService';
import { useAuthStore } from '../../auth';

interface DomainSettingsModalProps {
    open: boolean;
    onClose: () => void;
}

const DomainSettingsModal: React.FC<DomainSettingsModalProps> = ({ open, onClose }) => {
    const { currentUser } = useAuthStore();

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [slugError, setSlugError] = useState<string | null>(null);
    const [customDomain, setCustomDomain] = useState('');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    /**
     * Validates and sets the subdomain slug.
     * Only lowercase letters (a-z), digits (0-9), and hyphens (-) are allowed.
     * No dots, spaces, uppercase, or special characters.
     */
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const sanitized = raw.replace(/[^a-z0-9-]/g, '');

        if (raw !== sanitized) {
            setSlugError('Only lowercase letters (a-z), numbers, and hyphens are allowed.');
        } else {
            setSlugError(null);
        }

        setSlug(sanitized);
    };

    useEffect(() => {
        const effectiveUserId = useAuthStore.getState().effectiveUserId;
        if (open && effectiveUserId) {
            fetchBusiness();
        } else if (open) {
            // Reset fields for new creation
            setName('');
            setSlug('');
            setSlugError(null);
            setCustomDomain('');
            setError(null);
            setSuccess(null);
        }
    }, [open, currentUser?.userId]);

    const fetchBusiness = async () => {
        setFetching(true);
        setError(null);
        try {
            const effectiveUserId = useAuthStore.getState().effectiveUserId;
            if (!effectiveUserId) return;
            const res = await getBusinessByUserId(effectiveUserId);
            const data = res.data.filter(e => e.typeId = 1)[0];
            setName(data.name || '');
            setSlug(data.slug || '');
            setCustomDomain(data.customDomain || '');
        } catch (err: any) {
            console.error('Failed to fetch tenant', err);
            setError('Failed to load tenant information.');
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        if (!currentUser?.userId) return;

        if (!name || !slug) {
            setError('Name and Slug are required.');
            return;
        }

        if (slugError) {
            setError('Please fix the subdomain before saving.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {

            // Create new
            await createBusiness({
                ownerUserId: currentUser.userId,
                name,
                slug,
                customDomain: customDomain || undefined,
                isActive: true
            });

            setSuccess('Tenant created successfully.');


            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Failed to save tenant', err);
            setError(err.response?.data?.message || err.message || 'Failed to save tenant information.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'rgba(15, 26, 46, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    color: '#fff'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1, pt: 3, px: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
                    Domain Settings
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ px: 4, py: 2 }}>
                {fetching ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress sx={{ color: '#9D4EDD' }} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                            Configure your studio's custom domain and branding details.
                        </Typography>

                        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

                        <TextField
                            label="Studio Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            required
                            variant="outlined"
                            disabled={loading}
                            InputProps={{
                                sx: { color: '#fff', borderRadius: 2 }
                            }}
                            InputLabelProps={{
                                sx: { color: 'rgba(255,255,255,0.7)' }
                            }}
                        />

                        <TextField
                            label="Subdomain"
                            value={slug}
                            onChange={handleSlugChange}
                            fullWidth
                            required
                            variant="outlined"
                            disabled={loading}
                            error={!!slugError}
                            helperText={slugError || 'Only lowercase letters, numbers, and hyphens allowed'}
                            FormHelperTextProps={{ sx: { color: slugError ? '#f44336' : 'rgba(255,255,255,0.5)' } }}
                            InputProps={{
                                sx: { color: '#fff', borderRadius: 2 }
                            }}
                            InputLabelProps={{
                                sx: { color: 'rgba(255,255,255,0.7)' }
                            }}
                        />

                        <TextField
                            label="Custom Domain"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            fullWidth
                            variant="outlined"
                            disabled={loading}
                            placeholder="e.g. www.mystudio.com"
                            InputProps={{
                                sx: { color: '#fff', borderRadius: 2 }
                            }}
                            InputLabelProps={{
                                sx: { color: 'rgba(255,255,255,0.7)' }
                            }}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 4, pb: 4, pt: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={loading || fetching}
                    sx={{ color: '#94A3B8' }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={loading || fetching}
                    variant="contained"
                    sx={{
                        borderRadius: '12px',
                        background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                        fontWeight: 600,
                        px: 4,
                        '&:hover': {
                            background: 'linear-gradient(90deg, #6D28D9 0%, #9D4EDD 100%)',
                        },
                    }}
                >
                    {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DomainSettingsModal;
