import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
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
    Divider,
    TextField,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ContentCopy as CopyIcon,
    Link as LinkIcon
} from '@mui/icons-material';
import { useStudioManagement } from '../context/StudioManagementContext';
import { useAuth } from '../../auth';
import FolderTree from './FolderTree';

const ManageShareLinksModal = ({ open, onClose, project }) => {
    const { fetchShareLinks, createShareLink, updateShareLink, deleteShareLink } = useStudioManagement();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('list'); // 'list', 'create', 'edit'
    const [currentLink, setCurrentLink] = useState(null);
    const [error, setError] = useState('');

    // Form state
    const [linkName, setLinkName] = useState('');
    const [selectedFolders, setSelectedFolders] = useState(new Set());

    useEffect(() => {
        if (open && project) {
            loadLinks();
            setView('list');
            setError('');
        }
    }, [open, project]);

    const loadLinks = async () => {
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

    const handleEditClick = (link) => {
        setLinkName(link.name);
        setSelectedFolders(new Set(link.includedFolders || []));
        setCurrentLink(link);
        setView('edit');
        setError('');
    };

    const handleDeleteClick = async (linkId) => {
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

    const handleCopyLink = (linkId) => {
        const userId = project.userId;
        const url = `${window.location.origin}/share/${userId}/${project.id}/${linkId}`;
        navigator.clipboard.writeText(url);
        // Could show a snackbar here, but for now just alert or nothing
        alert("Link copied to clipboard!");
    };

    const handleToggleSelect = (folderId) => {
        const newSelected = new Set(selectedFolders);
        if (newSelected.has(folderId)) {
            newSelected.delete(folderId);
        } else {
            newSelected.add(folderId);
        }
        setSelectedFolders(newSelected);
    };

    const handleSave = async () => {
        if (!linkName.trim()) {
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
            } else if (view === 'edit') {
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

    const allowedFolderIds = project?.selectedFolders ? new Set(project.selectedFolders) : new Set();

    const renderList = () => (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Shareable Links</Typography>
                <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleCreateClick}>
                    Create New Link
                </Button>
            </Box>
            {links.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    No shareable links created yet.
                </Typography>
            ) : (
                <List>
                    {links.map((link) => (
                        <React.Fragment key={link.id}>
                            <ListItem>
                                <ListItemText
                                    primary={link.name}
                                    secondary={`Created: ${link.createdAt?.toDate ? link.createdAt.toDate().toLocaleDateString() : 'Just now'}`}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => handleCopyLink(link.id)} title="Copy Link">
                                        <CopyIcon />
                                    </IconButton>
                                    <IconButton edge="end" onClick={() => handleEditClick(link)} title="Edit">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" onClick={() => handleDeleteClick(link.id)} title="Delete">
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            )}
        </>
    );

    const renderForm = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">{view === 'create' ? 'Create New Link' : 'Edit Link'}</Typography>
            <TextField
                label="Link Name"
                fullWidth
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="e.g., Client Review"
            />
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Select Folders to Include
            </Typography>
            {allowedFolderIds.size > 0 ? (
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                    <FolderTree
                        folderStructure={project?.driveData}
                        selectedFolders={selectedFolders}
                        onToggleSelect={handleToggleSelect}
                        selectableIds={allowedFolderIds}
                    />
                </Box>
            ) : (
                <Typography color="text.secondary">
                    No synced folders available.
                </Typography>
            )}
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading && view === 'list' ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    view === 'list' ? renderList() : renderForm()
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={view === 'list' ? onClose : () => setView('list')}>
                    {view === 'list' ? 'Close' : 'Cancel'}
                </Button>
                {view !== 'list' && (
                    <Button onClick={handleSave} variant="contained" disabled={loading}>
                        Save
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ManageShareLinksModal;
