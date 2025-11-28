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

const CreateProjectModal = ({ open, onClose }) => {
    const { addProject } = useStudioManagement();
    const [projectName, setProjectName] = useState('');
    const [source, setSource] = useState('google_photos');
    const [driveUrl, setDriveUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        setProjectName('');
        setSource('google_photos');
        setDriveUrl('');
        setError('');
        onClose();
    };

    const handleSubmit = async () => {
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
            await addProject({
                name: projectName,
                source,
                driveUrl: source === 'google_drive' ? driveUrl : null,
            });
            handleClose();
        } catch (err) {
            setError('Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
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
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Project'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateProjectModal;
