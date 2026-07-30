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
    SelectChangeEvent,
    CircularProgress,
    Fade
} from '@mui/material';
import {
    CreateNewFolderOutlined as CreateIcon,
    EditOutlined as EditIcon
} from '@mui/icons-material';
import { useStudioManagementStore } from '../store/studioManagementStore';
import { useAuthStore } from '../../auth';
import FolderSelectionDialog from './FolderSelectionDialog';
import { DriveNode, ProjectJoinDriveData } from '../types';
import { useGlobalLoader } from '../../../core/context/globalLoader';
import { getFolderStructure, uploadDriveData } from '../api/GoogleService';

interface CreateProjectModalProps {
    open: boolean;
    onClose: () => void;
    projectData?: ProjectJoinDriveData | null;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onClose, projectData = null }) => {
    const addProject = useStudioManagementStore((state) => state.addProject);
    const updateProject = useStudioManagementStore((state) => state.updateProject);
    const currentUser = useAuthStore((state) => state.currentUser);
    const [projectName, setProjectName] = useState('');
    const [source, setSource] = useState('google_photos');
    const [driveUrl, setDriveUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { setIsLoading: setGlobalLoading } = useGlobalLoader();

    // New state for folder selection
    const [folderSelectionOpen, setFolderSelectionOpen] = useState(false);
    const [folderStructure, setFolderStructure] = useState<DriveNode | null>(null);
    const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

    const project = projectData?.project;
    const driveData = projectData?.driveData;

    const isEditMode = !!project;

    useEffect(() => {
        if (open) {
            if (project) {
                setProjectName(project.name);
                setSource(project.source);
                setDriveUrl(project.driveUrl || '');
                setFolderStructure(driveData?.driveData || null);
                setSelectedFolders(driveData?.selectedFolders || []);
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
                if (isEditMode && project && driveData?.driveData) {
                    // Use existing structure for edit
                    setFolderStructure(driveData?.driveData);
                    setFolderSelectionOpen(true);
                    setLoading(false);
                } else {
                    // Fetch folder structure first
                    const result = await getFolderStructure(driveUrl);
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

    const handleReload = async () => {
        if (!driveUrl) return;
        try {
            const result = await getFolderStructure(driveUrl);
            const newFolderStructure = result as DriveNode;
            setFolderStructure(newFolderStructure);

            if (isEditMode && project) {
                await updateProject(project.id, {
                    driveData: newFolderStructure
                });
            }
        } catch (err: any) {
            console.error("Error fetching folder structure:", err);
            setError(err.message || 'Failed to fetch folder structure. Please try again.');
        }
    };

    const handleSubmit = async (newSelectedFolders: string[] = []) => {
        setLoading(true);
        setGlobalLoading(true);
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
                const newProjectData: any = {
                    name: projectName,
                    source,
                    selectedFolders: foldersToSave,
                };
                if (source === 'google_drive' && driveUrl) {
                    newProjectData.driveUrl = driveUrl;
                }
                if (folderStructure) {
                    newProjectData.driveData = folderStructure;
                }

                const projectId = await addProject(newProjectData);

                if (projectId && source === 'google_drive' && foldersToSave.length > 0) {
                    await handleDriveUpload(projectId, foldersToSave);
                }
            }
            handleClose();
        } catch (err: any) {
            console.error("Error saving project:", err);
            setError(err.message || 'Failed to save project. Please try again.');
        } finally {
            setGlobalLoading(false);
            setLoading(false);
        }
    };

    const handleDriveUpload = async (projectId: string, folders: string[]) => {
        const viewAsUserId = useStudioManagementStore.getState().viewAsUserId;
        const effectiveUid = viewAsUserId || currentUser?.userId;
        if (!effectiveUid) return;
        const uploadPromises = folders.map(folderId => {
            return uploadDriveData({
                folderId: folderId,
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
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
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
                <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
                    {isEditMode ? <EditIcon color="primary" /> : <CreateIcon color="primary" />}
                    {isEditMode ? 'Edit Project' : 'Create New Project'}
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Fade in timeout={400}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                            {error && (
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}
                            <TextField
                                label="Project Name"
                                variant="outlined"
                                fullWidth
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                autoFocus
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                    }
                                }}
                            />
                            <FormControl fullWidth disabled={isEditMode}>
                                <InputLabel>Source</InputLabel>
                                <Select
                                    value={source}
                                    label="Source"
                                    onChange={handleSourceChange}
                                    sx={{ borderRadius: '12px' }}
                                >
                                    <MenuItem value="google_photos">Google Photos</MenuItem>
                                    <MenuItem value="google_drive">Google Drive</MenuItem>
                                </Select>
                            </FormControl>
                            {source === 'google_drive' && (
                                <TextField
                                    label="Google Drive Public URL"
                                    variant="outlined"
                                    fullWidth
                                    value={driveUrl}
                                    onChange={(e) => setDriveUrl(e.target.value)}
                                    placeholder="https://drive.google.com/..."
                                    disabled={isEditMode}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                        }
                                    }}
                                />
                            )}
                        </Box>
                    </Fade>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}>
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                        sx={{ color: 'text.secondary', fontWeight: 600, px: 3 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleInitialSubmit}
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
                        {loading ? <CircularProgress size={24} color="inherit" /> : (source === 'google_drive' ? 'Next' : (isEditMode ? 'Update Project' : 'Create Project'))}
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
                syncedFolders={driveData?.syncedFolders}
                projectId={project?.id}
                onReload={source === 'google_drive' ? handleReload : undefined}
            />
        </>
    );
};

export default CreateProjectModal;
