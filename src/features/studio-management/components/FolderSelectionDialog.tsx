import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import FolderTree from './FolderTree';
import { DriveNode, SyncedFolder } from '../types';

interface FolderSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    folderStructure: DriveNode | null;
    onConfirm: (selectedFolderIds: string[]) => void;
    initialSelection?: string[];
    syncedFolders?: Record<string, SyncedFolder>;
}

const FolderSelectionDialog: React.FC<FolderSelectionDialogProps> = ({
    open,
    onClose,
    folderStructure,
    onConfirm,
    initialSelection = [],
    syncedFolders = {}
}) => {
    const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set(initialSelection));

    // Reset selection when dialog opens or initialSelection changes
    useEffect(() => {
        if (open) {
            setSelectedFolders(new Set(initialSelection));
        }
    }, [open, initialSelection]);

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
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Select Folders to Sync</DialogTitle>
            <DialogContent dividers>
                <Typography variant="caption" component="div">
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                        <li>Select only the folders that need to be re-synced.</li>
                        <li>Avoid selecting folders that do not require synchronization.</li>
                        <li>Re-syncing unnecessary folders may increase processing time and cloud data usage.</li>
                    </ul>
                </Typography>
                {folderStructure && (
                    <FolderTree
                        folderStructure={folderStructure}
                        selectedFolders={selectedFolders}
                        onToggleSelect={handleToggleSelect}
                        onSelectAllChange={setSelectedFolders}
                        syncedFolders={syncedFolders}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">
                    Confirm & Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FolderSelectionDialog;
