import React, { useState, useEffect } from 'react';
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

const CreateProjectModal = ({ open, onClose, project = null }) => {
    const { addProject, updateProject } = useStudioManagement();
    const { currentUser } = useAuth();
    const [projectName, setProjectName] = useState('');
    const [source, setSource] = useState('google_photos');
    const [driveUrl, setDriveUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // New state for folder selection
    const [folderSelectionOpen, setFolderSelectionOpen] = useState(false);
    const [folderStructure, setFolderStructure] = useState(null);
    const [selectedFolders, setSelectedFolders] = useState([]);

    const isEditMode = !!project;

    useEffect(() => {
        if (open) {
            if (project) {
                setProjectName(project.name);
                setSource(project.source);
                setDriveUrl(project.driveUrl || '');
                setFolderStructure(project.driveData || null);
                setSelectedFolders(project.selectedFolders || []);
            } else {
                // Reset for create mode
                setProjectName('');
                setSource('google_photos');
                setDriveUrl('');
                setFolderStructure(null);
                setSelectedFolders([]);
            }
            setError('');
        }
    }, [open, project]);

    const handleClose = () => {
        setProjectName('');
        setSource('google_photos');
        setDriveUrl('');
        setError('');
        setFolderSelectionOpen(false);
        setFolderStructure(null);
        setSelectedFolders([]);
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
                if (isEditMode && project.driveData) {
                    // Use existing structure for edit
                    setFolderStructure(project.driveData);
                    setFolderSelectionOpen(true);
                    setLoading(false);
                } else {
                    // Fetch folder structure first
                    const getFolderStructure = httpsCallable(functions, 'getFolderStructure');
                    const result = await getFolderStructure({ url: driveUrl });
                    setFolderStructure(result.data);
                    setFolderSelectionOpen(true); // Open selection dialog
                    setLoading(false); // Stop loading for this modal
                }
            } else {
                // For other sources, proceed directly
                await handleSubmit();
            }
        } catch (err) {
            console.error("Error fetching folder structure:", err);
            setError(err.message || 'Failed to fetch folder structure. Please try again.');
            setLoading(false);
        }
    };

    const handleSubmit = async (newSelectedFolders = []) => {
        setLoading(true);
        try {
            const foldersToSave = source === 'google_drive' ? newSelectedFolders : [];

            if (isEditMode) {
                await updateProject(project.id, {
                    name: projectName,
                    selectedFolders: foldersToSave
                });
            } else {
                const projectId = await addProject({
                    name: projectName,
                    source,
                    driveUrl: source === 'google_drive' ? driveUrl : null,
                    driveData: folderStructure, // Save the full structure
                    selectedFolders: foldersToSave, // Save selected IDs
                });

                // Trigger upload for new projects only? Or should we re-upload on edit if selection changes?
                // Requirement: "on edit the user cannot change the google drive option but they can slect the folders to sync."
                // If they select NEW folders, we probably need to upload data for those new folders.
                // But `uploadDriveData` is for uploading file metadata to Firestore.
                // If we select new folders, we should probably run it for them.

                if (source === 'google_drive' && foldersToSave.length > 0) {
                    await handleDriveUpload(projectId || project.id, foldersToSave);
                }
            }

            // If editing and folders changed, we might need to trigger upload for newly selected ones.
            // For simplicity, let's re-run upload for all selected folders on edit too? 
            // Or filter for only new ones? 
            // The requirement says "folders which already synced can be selected for this" (referring to share link).
            // For edit, "they can slect the folders to sync".
            // Let's assume we should sync (upload data) for the current selection.
            if (isEditMode && source === 'google_drive') {
                await handleDriveUpload(project.id, foldersToSave);
            }

            handleClose();
        } catch (err) {
            console.error("Error saving project:", err);
            setError(err.message || 'Failed to save project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDriveUpload = async (projectId, folders) => {
        const uploadDriveData = httpsCallable(functions, 'uploadDriveData');
        const uploadPromises = folders.map(folderId => {
            return uploadDriveData({
                folderId: folderId,
                userId: currentUser.uid,
                projectId: projectId,
                recursive: false
            }).catch(err => {
                console.error(`Failed to upload data for folder ${folderId}:`, err);
            });
        });
        await Promise.all(uploadPromises);
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
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
                        <FormControl fullWidth disabled={isEditMode}>
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
                                disabled={isEditMode}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleInitialSubmit} variant="contained" disabled={loading}>
                        {source === 'google_drive' ? 'Next' : (isEditMode ? 'Update Project' : 'Create Project')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Folder Selection Dialog */}
            <FolderSelectionDialog
                open={folderSelectionOpen}
                onClose={() => setFolderSelectionOpen(false)}
                folderStructure={folderStructure}
                onConfirm={handleSubmit}
                initialSelection={selectedFolders}
            />
        </>
    );
};

export default CreateProjectModal;
