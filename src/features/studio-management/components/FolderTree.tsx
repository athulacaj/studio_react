import React, { useState } from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    IconButton,
    Box,
    Typography,
    Checkbox
} from '@mui/material';
import { ExpandLess, ExpandMore, Folder as FolderIcon } from '@mui/icons-material';
import { DriveNode } from '../types';

interface FolderItemProps {
    folder: DriveNode;
    selectedFolders: Set<string>;
    onToggleSelect: (folderId: string) => void;
    level?: number;
    readOnly?: boolean;
    selectableIds?: Set<string> | null;
}

const FolderItem: React.FC<FolderItemProps> = ({
    folder,
    selectedFolders,
    onToggleSelect,
    level = 0,
    readOnly = false,
    selectableIds = null
}) => {
    const [open, setOpen] = useState(false);

    // If selectableIds is provided, check if this folder is allowed to be selected
    const isSelectable = !selectableIds || selectableIds.has(folder.id);

    // If readOnly is true, everything is disabled.
    // If selectableIds is present, only allowed IDs are enabled.
    const isDisabled = readOnly || !isSelectable;

    const hasSubfolders = folder.folders && Object.keys(folder.folders).length > 0;
    const isSelected = selectedFolders.has(folder.id);

    const handleExpandClick = (e: React.MouseEvent) => {
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
                disablePadding
                sx={{
                    pl: level * 2,
                    opacity: isDisabled && !readOnly ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 40, ml: 1 }}>
                    {hasSubfolders ? (
                        <IconButton size="small" onClick={handleExpandClick}>
                            {open ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    ) : (
                        <Box sx={{ width: 34 }} />
                    )}
                </Box>

                <ListItemButton
                    onClick={handleToggle}
                    disabled={isDisabled}
                    sx={{ py: 0.5, flexGrow: 1 }}
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
                    <FolderIcon sx={{ mr: 1, color: 'action.active' }} />
                    <ListItemText
                        primary={folder.name}
                        secondary={!isSelectable && selectableIds ? "Not synced" : null}
                    />
                </ListItemButton>
            </ListItem>
            {hasSubfolders && folder.folders && (
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

interface FolderTreeProps {
    folderStructure?: DriveNode;
    selectedFolders: Set<string>;
    onToggleSelect: (folderId: string) => void;
    readOnly?: boolean;
    selectableIds?: Set<string> | null;
}

const FolderTree: React.FC<FolderTreeProps> = ({
    folderStructure,
    selectedFolders,
    onToggleSelect,
    readOnly = false,
    selectableIds = null
}) => {
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
