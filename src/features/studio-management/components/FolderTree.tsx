import React, { useState } from 'react';
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Collapse,
    IconButton,
    Box,
    Typography
} from '@mui/material';
import { ExpandLess, ExpandMore, Folder as FolderIcon } from '@mui/icons-material';

const FolderItem = ({ folder, selectedFolders, onToggleSelect, level = 0, readOnly = false, selectableIds = null }) => {
    const [open, setOpen] = useState(false);

    // If selectableIds is provided, check if this folder is allowed to be selected
    const isSelectable = !selectableIds || selectableIds.has(folder.id);

    // If readOnly is true, everything is disabled.
    // If selectableIds is present, only allowed IDs are enabled.
    const isDisabled = readOnly || !isSelectable;

    const hasSubfolders = folder.folders && Object.keys(folder.folders).length > 0;
    const isSelected = selectedFolders.has(folder.id);

    const handleExpandClick = (e) => {
        e.stopPropagation();
        setOpen(!open);
    };

    const handleToggle = () => {
        if (!isDisabled) {
            onToggleSelect(folder.id);
        }
    };

    return (
        <>
            <ListItem
                button={!isDisabled}
                onClick={handleToggle}
                sx={{ pl: level * 2 + 2, opacity: isDisabled && !readOnly ? 0.6 : 1 }}
            >
                <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox
                        edge="start"
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                        disabled={isDisabled}
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
                <ListItemText primary={folder.name} secondary={!isSelectable && selectableIds ? "Not synced" : null} />
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
                                readOnly={readOnly}
                                selectableIds={selectableIds}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

const FolderTree = ({ folderStructure, selectedFolders, onToggleSelect, readOnly = false, selectableIds = null }) => {
    if (!folderStructure) {
        return <Typography color="text.secondary">No folder structure available.</Typography>;
    }

    return (
        <List>
            <FolderItem
                folder={folderStructure}
                selectedFolders={selectedFolders}
                onToggleSelect={onToggleSelect}
                readOnly={readOnly}
                selectableIds={selectableIds}
            />
        </List>
    );
};

export default FolderTree;
