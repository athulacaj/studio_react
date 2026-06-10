import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    TextField,
    Alert,
    CircularProgress,
    Paper,
    Fade,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    DeleteOutline as DeleteIcon,
    EditOutlined as EditIcon,
    ContentCopyOutlined as CopyIcon,
    Link as LinkIcon
} from '@mui/icons-material';
import { useStudioManagementStore } from '../store/studioManagementStore';
import FolderTree from './FolderTree';
import { Project, SharedLink } from '../types';

interface ManageShareLinksModalProps {
    open: boolean;
    onClose: () => void;
    project: Project | null;
}

type ViewMode = 'list' | 'create' | 'edit';

const ManageShareLinksModal: React.FC<ManageShareLinksModalProps> = ({ open, onClose, project }) => {
    const fetchShareLinks = useStudioManagementStore((state) => state.fetchShareLinks);
    const createShareLink = useStudioManagementStore((state) => state.createShareLink);
    const updateShareLink = useStudioManagementStore((state) => state.updateShareLink);
    const deleteShareLink = useStudioManagementStore((state) => state.deleteShareLink);
    const [links, setLinks] = useState<SharedLink[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<ViewMode>('list');
    const [currentLink, setCurrentLink] = useState<SharedLink | null>(null);
    const [error, setError] = useState('');

    // Form state
    const [linkName, setLinkName] = useState('');
    const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (open && project) {
            loadLinks();
            setView('list');
            setError('');
        }
    }, [open, project]);

    const loadLinks = async () => {
        if (!project) return;
        setLoading(true);
        try {
            const fetchedLinks = await fetchShareLinks(project.id);
            setLinks(fetchedLinks);
        } catch (err) {
            console.error("Error loading links:", err);
            setError("Failed to load shareable links.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setLinkName('');
        setSelectedFolders(new Set());
        setView('create');
        setError('');
    };

    const handleEditClick = (link: SharedLink) => {
        setLinkName(link.name);
        setSelectedFolders(new Set(link.includedFolders || []));
        setCurrentLink(link);
        setView('edit');
        setError('');
    };

    const handleDeleteClick = async (linkId: string) => {
        if (!project) return;
        if (window.confirm("Are you sure you want to delete this link?")) {
            try {
                await deleteShareLink(project.id, linkId);
                setLinks(prev => prev.filter(l => l.id !== linkId));
            } catch (err) {
                console.error("Error deleting link:", err);
                setError("Failed to delete link.");
            }
        }
    };

    const handleCopyLink = (linkId: string) => {
        if (!project) return;
        const userId = project.userId;
        const url = `${window.location.origin}/share/${userId}/${project.id}/${linkId}`;
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    const handleToggleSelect = (folderId: string) => {
        const newSelected = new Set(selectedFolders);
        if (newSelected.has(folderId)) {
            newSelected.delete(folderId);
        } else {
            newSelected.add(folderId);
        }
        setSelectedFolders(newSelected);
    };

    const handleSave = async () => {
        if (!project || !linkName.trim()) {
            setError('Link name is required');
            return;
        }
        if (selectedFolders.size === 0) {
            setError('Please select at least one folder');
            return;
        }

        setLoading(true);
        try {
            const linkData = {
                name: linkName,
                includedFolders: Array.from(selectedFolders),
                sourceProjectId: project.id
            };

            if (view === 'create') {
                await createShareLink(project.id, linkData);
            } else if (view === 'edit' && currentLink) {
                await updateShareLink(project.id, currentLink.id, linkData);
            }

            await loadLinks();
            setView('list');
        } catch (err) {
            console.error("Error saving link:", err);
            setError("Failed to save link.");
        } finally {
            setLoading(false);
        }
    };

    const allowedFolderIds = project?.selectedFolders ? new Set(project.selectedFolders) : new Set<string>();

    const renderList = () => (
        <Fade in timeout={400}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinkIcon color="primary" /> Shareable Links
                    </Typography>
                    <Button 
                        startIcon={<AddIcon />} 
                        variant="contained" 
                        size="medium" 
                        onClick={handleCreateClick}
                        sx={{ borderRadius: '8px', boxShadow: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                        Create New Link
                    </Button>
                </Box>
                {links.length === 0 ? (
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            py: 8, 
                            px: 4, 
                            textAlign: 'center', 
                            bgcolor: 'background.default',
                            border: '1px dashed',
                            borderColor: 'divider',
                            borderRadius: 3
                        }}
                    >
                        <LinkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No shareable links yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create your first link to share project folders with clients or team members.
                        </Typography>
                    </Paper>
                ) : (
                    <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {links.map((link) => (
                            <Paper 
                                key={link.id} 
                                elevation={1} 
                                sx={{ 
                                    borderRadius: 2, 
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: 3,
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <ListItem sx={{ p: 2 }}>
                                    <ListItemText
                                        primary={<Typography variant="subtitle1" fontWeight="600">{link.name}</Typography>}
                                        secondary={
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {`Created on ${link.createdAt?.toDate ? link.createdAt.toDate().toLocaleDateString() : 'Just now'}`}
                                                {` • ${link.includedFolders?.length || 0} folder(s)`}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction sx={{ right: 16 }}>
                                        <Tooltip title="Copy Link" placement="top">
                                            <IconButton edge="end" onClick={() => handleCopyLink(link.id)} sx={{ mr: 1, color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.dark' } }}>
                                                <CopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit Link" placement="top">
                                            <IconButton edge="end" onClick={() => handleEditClick(link)} sx={{ mr: 1, color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.dark' } }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Link" placement="top">
                                            <IconButton edge="end" onClick={() => handleDeleteClick(link.id)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'error.dark' } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </Paper>
                        ))}
                    </List>
                )}
            </Box>
        </Fade>
    );

    const renderForm = () => (
        <Fade in timeout={400}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {view === 'create' ? 'Create New Link' : 'Edit Link'}
                </Typography>
                
                <TextField
                    label="Link Name"
                    variant="outlined"
                    fullWidth
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    placeholder="e.g., Client Review Batch 1"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                        }
                    }}
                />
                
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 500 }}>
                        Select Folders to Include
                    </Typography>
                    {Object.keys(project?.syncedFolders || {}).length > 0 ? (
                        <Paper 
                            variant="outlined"
                            sx={{ 
                                borderRadius: 3, 
                                overflow: 'hidden',
                                bgcolor: 'background.default',
                                borderColor: 'divider'
                            }}
                        >
                            <Box sx={{ maxHeight: 350, overflow: 'auto', p: 1 }}>
                                <FolderTree
                                    folderStructure={project?.driveData}
                                    selectedFolders={selectedFolders}
                                    onToggleSelect={handleToggleSelect}
                                    onSelectAllChange={setSelectedFolders}
                                    selectableIds={allowedFolderIds}
                                    syncedFolders={project?.syncedFolders}
                                />
                            </Box>
                        </Paper>
                    ) : (
                        <Paper 
                            variant="outlined" 
                            sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: 'background.default', borderColor: 'divider' }}
                        >
                            <Typography color="text.secondary">
                                No synced folders available. Sync folders from the project details page first.
                            </Typography>
                        </Paper>
                    )}
                </Box>
            </Box>
        </Fade>
    );

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                    backgroundImage: 'none',
                    bgcolor: 'background.paper',
                    p: 1
                }
            }}
        >
            <DialogContent sx={{ p: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}
                {loading && view === 'list' ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    view === 'list' ? renderList() : renderForm()
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: view === 'list' ? 'flex-end' : 'space-between' }}>
                <Button 
                    onClick={view === 'list' ? onClose : () => setView('list')}
                    sx={{ color: 'text.secondary', fontWeight: 600, px: 3 }}
                >
                    {view === 'list' ? 'Close' : 'Back to List'}
                </Button>
                {view !== 'list' && (
                    <Button 
                        onClick={handleSave} 
                        variant="contained" 
                        disabled={loading}
                        sx={{ 
                            borderRadius: '8px', 
                            px: 4, 
                            py: 1,
                            fontWeight: 600,
                            boxShadow: 2
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Link'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ManageShareLinksModal;
