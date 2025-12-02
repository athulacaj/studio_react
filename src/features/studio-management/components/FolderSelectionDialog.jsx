import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Collapse,
    IconButton,
    Box
} from '@mui/material';
import { ExpandLess, ExpandMore, Folder as FolderIcon } from '@mui/icons-material';

const FolderItem = ({ folder, selectedFolders, onToggleSelect, level = 0 }) => {
    const [open, setOpen] = useState(false);
    const hasSubfolders = folder.folders && Object.keys(folder.folders).length > 0;
    const isSelected = selectedFolders.has(folder.id);

    const handleExpandClick = (e) => {
        e.stopPropagation();
        setOpen(!open);
    };

    const handleToggle = () => {
        onToggleSelect(folder.id);
    };

    return (
        <>
            <ListItem
                button
                onClick={handleToggle}
                sx={{ pl: level * 2 + 2 }}
            >
                <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox
                        edge="start"
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                    />
                </ListItemIcon>
                {hasSubfolders ? (
                    <IconButton size="small" onClick={handleExpandClick} sx={{ mr: 1 }}>
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                ) : (
                    <Box sx={{ width: 28, mr: 1 }} />
                )}
                <FolderIcon sx={{ mr: 1, color: 'action.active' }} />
                <ListItemText primary={folder.name} />
            </ListItem>
            {hasSubfolders && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {Object.values(folder.folders).map((subfolder) => (
                            <FolderItem
                                key={subfolder.id}
                                folder={subfolder}
                                selectedFolders={selectedFolders}
                                onToggleSelect={onToggleSelect}
                                level={level + 1}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

const FolderSelectionDialog = ({ open, onClose, folderStructure, onConfirm }) => {
    const [selectedFolders, setSelectedFolders] = useState(new Set());

    const handleToggleSelect = (folderId) => {
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
                <List>
                    {folderStructure && (
                        <FolderItem
                            folder={folderStructure}
                            selectedFolders={selectedFolders}
                            onToggleSelect={handleToggleSelect}
                        />
                    )}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">
                    Confirm & Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FolderSelectionDialog;
