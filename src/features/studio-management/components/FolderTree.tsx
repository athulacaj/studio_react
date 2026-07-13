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
import { DriveNode, SyncedFolder } from '../types';

interface FolderItemProps {
    folder: DriveNode;
    selectedFolders: Set<string>;
    onToggleSelect: (folderId: string) => void;
    level?: number;
    readOnly?: boolean;
    selectableIds?: Set<string> | null;
    syncedFolders: Record<string, SyncedFolder>
    type: "edit_project_modal" | "share_link_modal";
}

const FolderItem: React.FC<FolderItemProps> = ({
    folder,
    selectedFolders,
    onToggleSelect,
    level = 0,
    readOnly = false,
    selectableIds = null,
    syncedFolders = {},
    type
}) => {
    const [open, setOpen] = useState(false);

    // If selectableIds is provided, check if this folder is allowed to be selected
    const isSelectable = !selectableIds || selectableIds.has(folder.id);

    // If readOnly is true, everything is disabled.
    // If selectableIds is present, only allowed IDs are enabled.
    let isDisabled = false
    if (type == "share_link_modal") {
        isDisabled = readOnly || !syncedFolders[folder.id];
    }

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
                        secondary={syncedFolders[folder.id] ? `last synced: ${syncedFolders[folder.id].syncTime.toString().substring(0, 10)}` : "..."}
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
                                syncedFolders={syncedFolders}
                                type={type}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

const getAllSelectableFolderIds = (
    node: DriveNode | undefined | null,
    selectableIds: Set<string> | null
): string[] => {
    if (!node) return [];
    const ids: string[] = [];

    const traverse = (currentNode: DriveNode) => {
        const isSelectable = !selectableIds || selectableIds.has(currentNode.id);
        if (isSelectable) {
            ids.push(currentNode.id);
        }

        if (currentNode.folders) {
            Object.values(currentNode.folders).forEach(childNode => {
                traverse(childNode);
            });
        }
    };

    traverse(node);
    return ids;
};

interface FolderTreeProps {
    folderStructure?: DriveNode;
    selectedFolders: Set<string>;
    onToggleSelect: (folderId: string) => void;
    onSelectAllChange?: (selectedIds: Set<string>) => void;
    readOnly?: boolean;
    selectableIds?: Set<string> | null;
    syncedFolders?: Record<string, SyncedFolder>;
    type: "edit_project_modal" | "share_link_modal";
}

const FolderTree: React.FC<FolderTreeProps> = ({
    folderStructure,
    selectedFolders,
    onToggleSelect,
    onSelectAllChange,
    readOnly = false,
    selectableIds = null,
    syncedFolders = {},
    type = "share_link_modal"
}) => {
    const selectableFolderIds = React.useMemo(() => {
        return getAllSelectableFolderIds(folderStructure, selectableIds);
    }, [folderStructure, selectableIds]);

    if (!folderStructure) {
        return <Typography color="text.secondary">No folder structure available.</Typography>;
    }

    const handleSelectAllCheckboxChange = () => {
        if (!onSelectAllChange) return;

        const allSelected = selectableFolderIds.length > 0 && selectableFolderIds.every(id => selectedFolders.has(id));
        const newSelected = new Set(selectedFolders);
        if (allSelected) {
            selectableFolderIds.forEach(id => newSelected.delete(id));
        } else {
            selectableFolderIds.forEach(id => newSelected.add(id));
        }
        onSelectAllChange(newSelected);
    };

    const totalSelectable = selectableFolderIds.length;
    const selectedCount = selectableFolderIds.filter(id => selectedFolders.has(id)).length;

    const isAllChecked = totalSelectable > 0 && selectedCount === totalSelectable;
    const isIndeterminate = totalSelectable > 0 && selectedCount > 0 && selectedCount < totalSelectable;

    return (
        <Box>
            {onSelectAllChange && totalSelectable > 0 && (
                <ListItem
                    disablePadding
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        pb: 1,
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <ListItemButton
                        onClick={handleSelectAllCheckboxChange}
                        disabled={readOnly}
                        sx={{ py: 0.5 }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <Checkbox
                                edge="start"
                                checked={isAllChecked}
                                indeterminate={isIndeterminate}
                                tabIndex={-1}
                                disableRipple
                                disabled={readOnly}
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary="Select All"
                            secondary={`${selectedCount} of ${totalSelectable} folder(s) selected`}
                        />
                    </ListItemButton>
                </ListItem>
            )}
            <List>
                <FolderItem
                    folder={folderStructure}
                    selectedFolders={selectedFolders}
                    onToggleSelect={onToggleSelect}
                    readOnly={readOnly}
                    selectableIds={selectableIds}
                    syncedFolders={syncedFolders}
                    type={type}
                />
            </List>
        </Box>
    );
};

export default FolderTree;
