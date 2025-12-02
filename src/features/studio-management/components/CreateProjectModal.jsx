import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Alert
} from '@mui/material';
import { useStudioManagement } from '../context/StudioManagementContext';
import { useAuth } from '../../auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../config/firebase';
import FolderSelectionDialog from './FolderSelectionDialog';

const CreateProjectModal = ({ open, onClose }) => {
    const { addProject } = useStudioManagement();
    const { currentUser } = useAuth();
    const [projectName, setProjectName] = useState('');
    const [source, setSource] = useState('google_photos');
    const [driveUrl, setDriveUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // New state for folder selection
    const [folderSelectionOpen, setFolderSelectionOpen] = useState(false);
    const [folderStructure, setFolderStructure] = useState(null);

    const handleClose = () => {
        setProjectName('');
        setSource('google_photos');
        setDriveUrl('');
        setError('');
        setFolderSelectionOpen(false);
        setFolderStructure(null);
        onClose();
    };

    const handleInitialSubmit = async () => {
        setError('');
        if (!projectName.trim()) {
            setError('Project name is required');
            return;
        }
        if (source === 'google_drive' && !driveUrl.trim()) {
            setError('Google Drive URL is required');
            return;
        }

        setLoading(true);
        try {
            if (source === 'google_drive') {
                // Fetch folder structure first
                const getFolderStructure = httpsCallable(functions, 'getFolderStructure');
                const result = await getFolderStructure({ url: driveUrl });
                setFolderStructure(result.data);
                setFolderSelectionOpen(true); // Open selection dialog
                setLoading(false); // Stop loading for this modal
            } else {
                // For other sources, proceed directly
                await createProject();
            }
        } catch (err) {
            console.error("Error fetching folder structure:", err);
            setError(err.message || 'Failed to fetch folder structure. Please try again.');
            setLoading(false);
        }
    };

    const createProject = async (selectedFolders = []) => {
        setLoading(true);
        try {
            const projectId = await addProject({
                name: projectName,
                source,
                driveUrl: source === 'google_drive' ? driveUrl : null,
                driveData: folderStructure, // Save the full structure
                selectedFolders: source === 'google_drive' ? selectedFolders : [], // Save selected IDs
            });

            if (source === 'google_drive' && selectedFolders.length > 0) {
                const uploadDriveData = httpsCallable(functions, 'uploadDriveData');

                // Process folders sequentially or in parallel? Parallel is probably fine for a few folders.
                // Let's do it in parallel but catch errors individually so one failure doesn't stop others?
                // Or just Promise.all to wait for all.

                const uploadPromises = selectedFolders.map(folderId => {
                    return uploadDriveData({
                        folderId: folderId,
                        userId: currentUser.uid, // Assuming currentUser is available from context or auth hook
                        projectId: projectId,
                        recursive: false
                    }).catch(err => {
                        console.error(`Failed to upload data for folder ${folderId}:`, err);
                        // We might want to notify the user, but for now just log it.
                    });
                });

                await Promise.all(uploadPromises);
            }

            handleClose();
        } catch (err) {
            console.error("Error creating project:", err);
            setError(err.message || 'Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <TextField
                            label="Project Name"
                            fullWidth
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            autoFocus
                        />
                        <FormControl fullWidth>
                            <InputLabel>Source</InputLabel>
                            <Select
                                value={source}
                                label="Source"
                                onChange={(e) => setSource(e.target.value)}
                            >
                                <MenuItem value="google_photos">Google Photos</MenuItem>
                                <MenuItem value="google_drive">Google Drive</MenuItem>
                            </Select>
                        </FormControl>
                        {source === 'google_drive' && (
                            <TextField
                                label="Google Drive Public URL"
                                fullWidth
                                value={driveUrl}
                                onChange={(e) => setDriveUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleInitialSubmit} variant="contained" disabled={loading}>
                        {source === 'google_drive' ? 'Next' : 'Create Project'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Folder Selection Dialog */}
            <FolderSelectionDialog
                open={folderSelectionOpen}
                onClose={() => setFolderSelectionOpen(false)}
                folderStructure={folderStructure}
                onConfirm={createProject}
            />
        </>
    );
};

export default CreateProjectModal;
