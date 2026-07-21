import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert,
} from '@mui/material';
import { CreateNewFolder as FolderIcon } from '@mui/icons-material';
import { useDriveIntegrationStore } from '../store/driveIntegrationStore';

interface CreateDriveFolderDialogProps {
    open: boolean;
    onClose: () => void;
    connectionId: string;
    parentFolderId: string;
}

const CreateDriveFolderDialog: React.FC<CreateDriveFolderDialogProps> = ({
    open,
    onClose,
    connectionId,
    parentFolderId,
}) => {
    const createFolder = useDriveIntegrationStore((state) => state.createFolder);
    const [folderName, setFolderName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!folderName.trim()) {
            setError('Folder name is required');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await createFolder(connectionId, parentFolderId, folderName.trim());
            setFolderName('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create folder');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFolderName('');
        setError('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    backgroundImage: 'none',
                    bgcolor: 'background.paper',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600, pb: 1 }}>
                <FolderIcon color="primary" />
                Create New Folder
            </DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        label="Folder Name"
                        variant="outlined"
                        fullWidth
                        autoFocus
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        disabled={loading}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                            },
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleCreate}
                    variant="contained"
                    disabled={loading || !folderName.trim()}
                    sx={{ borderRadius: '8px', fontWeight: 600, px: 3 }}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateDriveFolderDialog;
