import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Box, Typography, Button, IconButton, Paper, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { CloudUpload as UploadIcon, Close as CloseIcon, Image as ImageIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';

interface UploadDialogComponentProps {
    open: boolean;
    onClose: () => void;
    onUpload: (files: File[]) => void;
    multiple?: boolean;
    accept?: string;
}

const UploadDialogComponent: React.FC<UploadDialogComponentProps> = ({ open, onClose, onUpload, multiple = true, accept = "image/*" }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesSelect(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            handleFilesSelect(Array.from(e.target.files));
        }
    };

    const handleFilesSelect = (files: File[]) => {
        const newFiles = multiple ? [...selectedFiles, ...files] : [files[0]];
        setSelectedFiles(newFiles);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadClick = () => {
        onUpload(selectedFiles);
        setSelectedFiles([]);
        onClose();
    };

    const handleCloseClick = () => {
        setSelectedFiles([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleCloseClick} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0f172a', color: '#fff', borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Upload Files</Typography>
                <IconButton onClick={handleCloseClick} sx={{ color: '#94A3B8' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <Paper
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    sx={{
                        p: 4,
                        border: '2px dashed',
                        borderColor: dragActive ? '#C084FC' : 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        bgcolor: dragActive ? 'rgba(192, 132, 252, 0.05)' : 'rgba(15, 26, 46, 0.6)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: '#C084FC',
                            bgcolor: 'rgba(192, 132, 252, 0.05)'
                        },
                        mb: selectedFiles.length > 0 ? 3 : 0
                    }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        multiple={multiple}
                        onChange={handleChange}
                        style={{ display: 'none' }}
                    />
                    <UploadIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                        Click or drag files to upload
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        Accepted files: {accept}
                    </Typography>
                </Paper>

                {selectedFiles.length > 0 && (
                    <List sx={{ mt: 2 }}>
                        {selectedFiles.map((file, index) => (
                            <ListItem key={`${file.name}-${index}`} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, mb: 1 }}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'transparent', color: '#94A3B8' }}>
                                        {file.type.startsWith('image/') ? <ImageIcon /> : <FileIcon />}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={file.name} 
                                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} 
                                    primaryTypographyProps={{ color: '#fff', noWrap: true }}
                                    secondaryTypographyProps={{ color: '#94A3B8' }}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={(e) => { e.stopPropagation(); removeFile(index); }} sx={{ color: '#94A3B8' }}>
                                        <CloseIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleCloseClick} sx={{ color: '#94A3B8' }}>Cancel</Button>
                <Button 
                    variant="contained" 
                    onClick={handleUploadClick}
                    disabled={selectedFiles.length === 0}
                    sx={{
                        borderRadius: '8px',
                        background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                        px: 4,
                        '&:disabled': {
                            background: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.3)'
                        }
                    }}
                >
                    Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UploadDialogComponent;
