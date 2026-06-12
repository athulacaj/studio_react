import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    Paper,
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import { FolderCopyOutlined as FolderIcon, Sync as SyncIcon } from '@mui/icons-material';
import FolderTree from './FolderTree';
import { DriveNode, SyncedFolder } from '../types';
import { useStudioManagementStore } from '../store/studioManagementStore';

interface FolderSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    folderStructure: DriveNode | null;
    onConfirm: (selectedFolderIds: string[]) => void;
    initialSelection?: string[];
    syncedFolders?: Record<string, SyncedFolder>;
    projectId?: string;
    onReload?: () => Promise<void>;
}

const FolderSelectionDialog: React.FC<FolderSelectionDialogProps> = ({
    open,
    onClose,
    folderStructure,
    onConfirm,
    initialSelection = [],
    syncedFolders = {},
    projectId,
    onReload
}) => {
    const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set(initialSelection));
    const [confirmReloadOpen, setConfirmReloadOpen] = useState(false);
    const [isReloading, setIsReloading] = useState(false);
    const updateProjectLocalState = useStudioManagementStore((state) => state.updateProjectLocalState);

    // Reset selection when dialog opens or initialSelection changes
    useEffect(() => {
        if (open) {
            setSelectedFolders(new Set(initialSelection));
        }
    }, [open, initialSelection]);

    useEffect(() => {
        if (open && projectId) {
            updateProjectLocalState(projectId);
        }
    }, [open]);

    const handleToggleSelect = (folderId: string) => {
        const newSelected = new Set(selectedFolders);
        if (newSelected.has(folderId)) {
            newSelected.delete(folderId);
        } else {
            newSelected.add(folderId);
        }
        setSelectedFolders(newSelected);
    };

    const handleConfirm = () => {
        onConfirm(Array.from(selectedFolders));
    };

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
            <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FolderIcon color="primary" /> Select Folders to Sync
                </Box>
                {onReload && (
                    <Tooltip title="Reload folders">
                        <IconButton onClick={() => setConfirmReloadOpen(true)} disabled={isReloading}>
                            {isReloading ? <CircularProgress size={24} /> : <SyncIcon />}
                        </IconButton>
                    </Tooltip>
                )}
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    <Typography variant="body2" component="div">
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                            <li>Select only the folders that need to be re-synced.</li>
                            <li>Avoid selecting folders that do not require synchronization.</li>
                            <li>Re-syncing unnecessary folders may increase processing time and cloud data usage.</li>
                        </ul>
                    </Typography>
                </Alert>

                {folderStructure && (
                    <Paper
                        variant="outlined"
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            bgcolor: 'background.default',
                            borderColor: 'divider',
                            p: 1
                        }}
                    >
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                            <FolderTree
                                folderStructure={folderStructure}
                                selectedFolders={selectedFolders}
                                onToggleSelect={handleToggleSelect}
                                onSelectAllChange={setSelectedFolders}
                                syncedFolders={syncedFolders}
                                type='edit_project_modal'
                            />
                        </Box>
                    </Paper>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}>
                <Button
                    onClick={onClose}
                    sx={{ color: 'text.secondary', fontWeight: 600, px: 3 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="primary"
                    sx={{
                        borderRadius: '8px',
                        px: 4,
                        py: 1,
                        fontWeight: 600,
                        boxShadow: 2
                    }}
                >
                    Confirm & Save
                </Button>
            </DialogActions>

            {/* Confirm Reload Dialog */}
            <Dialog open={confirmReloadOpen} onClose={() => setConfirmReloadOpen(false)}>
                <DialogTitle>Confirm Resync</DialogTitle>
                <DialogContent>
                    <Typography>
                        You are going to resync folders. Do it only if new folders are added in the google drive.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmReloadOpen(false)} sx={{ color: 'text.secondary' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={async () => {
                            setConfirmReloadOpen(false);
                            setIsReloading(true);
                            try {
                                await onReload?.();
                            } finally {
                                setIsReloading(false);
                            }
                        }} 
                        variant="contained" 
                        color="primary"
                        sx={{ borderRadius: '8px' }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default FolderSelectionDialog;
