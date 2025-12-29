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
    Alert,
    SelectChangeEvent
} from '@mui/material';
import { useStudioManagement } from '../context/StudioManagementContext';
import { useAuth } from '../../auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../config/firebase';
import FolderSelectionDialog from './FolderSelectionDialog';
import { Project, DriveNode } from '../types';

interface CreateProjectModalProps {
    open: boolean;
    onClose: () => void;
    project?: Project | null;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onClose, project = null }) => {
    const { addProject, updateProject } = useStudioManagement();
    const auth = useAuth();
    const currentUser = auth?.currentUser;
    const [projectName, setProjectName] = useState('');
    const [source, setSource] = useState('google_photos');
    const [driveUrl, setDriveUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // New state for folder selection
    const [folderSelectionOpen, setFolderSelectionOpen] = useState(false);
    const [folderStructure, setFolderStructure] = useState<DriveNode | null>(null);
    const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

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
                if (isEditMode && project && project.driveData) {
                    // Use existing structure for edit
                    setFolderStructure(project.driveData);
                    setFolderSelectionOpen(true);
                    setLoading(false);
                } else {
                    // Fetch folder structure first
                    const getFolderStructure = httpsCallable(functions, 'getFolderStructure');
                    const result = await getFolderStructure({ url: driveUrl });
                    setFolderStructure(result.data as DriveNode);
                    setFolderSelectionOpen(true); // Open selection dialog
                    setLoading(false); // Stop loading for this modal
                }
            } else {
                // For other sources, proceed directly
                await handleSubmit();
            }
        } catch (err: any) {
            console.error("Error fetching folder structure:", err);
            setError(err.message || 'Failed to fetch folder structure. Please try again.');
            setLoading(false);
        }
    };

    const handleSubmit = async (newSelectedFolders: string[] = []) => {
        setLoading(true);
        try {
            const foldersToSave = source === 'google_drive' ? newSelectedFolders : [];

            if (isEditMode && project) {
                await updateProject(project.id, {
                    name: projectName,
                    selectedFolders: foldersToSave
                });
                if (source === 'google_drive') {
                    await handleDriveUpload(project.id, foldersToSave);
                }
            } else {
                const projectId = await addProject({
                    name: projectName,
                    source,
                    driveUrl: source === 'google_drive' ? driveUrl : undefined,
                    driveData: folderStructure || undefined, // Save the full structure
                    selectedFolders: foldersToSave, // Save selected IDs
                });

                if (projectId && source === 'google_drive' && foldersToSave.length > 0) {
                    await handleDriveUpload(projectId, foldersToSave);
                }
            }

            handleClose();
        } catch (err: any) {
            console.error("Error saving project:", err);
            setError(err.message || 'Failed to save project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDriveUpload = async (projectId: string, folders: string[]) => {
        if (!currentUser) return;
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

    const handleSourceChange = (e: SelectChangeEvent) => {
        setSource(e.target.value);
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
                                onChange={handleSourceChange}
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
