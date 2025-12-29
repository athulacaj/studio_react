import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import FolderTree from './FolderTree';
import { DriveNode } from '../types';

interface FolderSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    folderStructure: DriveNode | null;
    onConfirm: (selectedFolderIds: string[]) => void;
    initialSelection?: string[];
}

const FolderSelectionDialog: React.FC<FolderSelectionDialogProps> = ({
    open,
    onClose,
    folderStructure,
    onConfirm,
    initialSelection = []
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
                {folderStructure && (
                    <FolderTree
                        folderStructure={folderStructure}
                        selectedFolders={selectedFolders}
                        onToggleSelect={handleToggleSelect}
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
