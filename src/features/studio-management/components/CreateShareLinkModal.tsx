import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Alert,
    Typography
} from '@mui/material';
import { useStudioManagement } from '../context/StudioManagementContext';
import FolderTree from './FolderTree';

const CreateShareLinkModal = ({ open, onClose, project }) => {
    const { createShareLink } = useStudioManagement();
    const [linkName, setLinkName] = useState('');
    const [selectedFolders, setSelectedFolders] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setLinkName('');
            setSelectedFolders(new Set());
            setError('');
        }
    }, [open]);

    const handleToggleSelect = (folderId) => {
        const newSelected = new Set(selectedFolders);
        if (newSelected.has(folderId)) {
            newSelected.delete(folderId);
        } else {
            newSelected.add(folderId);
        }
        setSelectedFolders(newSelected);
    };

    const handleSubmit = async () => {
        if (!linkName.trim()) {
            setError('Link name is required');
            return;
        }
        if (selectedFolders.size === 0) {
            setError('Please select at least one folder to share');
            return;
        }

        setLoading(true);
        try {
            await createShareLink(project.id, {
                name: linkName,
                includedFolders: Array.from(selectedFolders),
                sourceProjectId: project.id
            });
            onClose();
        } catch (err) {
            console.error("Error creating share link:", err);
            setError(err.message || 'Failed to create share link');
        } finally {
            setLoading(false);
        }
    };

    // Filter available folders: only those that are in project.selectedFolders
    // We pass this Set to FolderTree as a filter?
    // FolderTree logic: if filterIds is provided, only show those.
    // We need to construct a Set of allowed IDs.
    const allowedFolderIds = project?.selectedFolders ? new Set(project.selectedFolders) : new Set();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Create Shareable Link</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        label="Link Name"
                        fullWidth
                        value={linkName}
                        onChange={(e) => setLinkName(e.target.value)}
                        placeholder="e.g., Client Review - Batch 1"
                        autoFocus
                    />

                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Select Folders to Include
                    </Typography>

                    {allowedFolderIds.size > 0 ? (
                        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, maxHeight: 400, overflow: 'auto' }}>
                            <FolderTree
                                folderStructure={project?.driveData}
                                selectedFolders={selectedFolders}
                                onToggleSelect={handleToggleSelect}
                                selectableIds={allowedFolderIds}
                            />
                        </Box>
                    ) : (
                        <Typography color="text.secondary">
                            No synced folders available in this project. Please edit the project to sync folders first.
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    Create Link
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateShareLinkModal;
