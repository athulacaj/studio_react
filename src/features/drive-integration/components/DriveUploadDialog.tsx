import React, { useState, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    LinearProgress,
    Alert,
    Chip,
    alpha,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Image as ImageIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useDriveIntegrationStore } from '../store/driveIntegrationStore';

interface DriveUploadDialogProps {
    open: boolean;
    onClose: () => void;
    connectionId: string;
    folderId: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const DriveUploadDialog: React.FC<DriveUploadDialogProps> = ({
    open,
    onClose,
    connectionId,
    folderId,
}) => {
    const uploadMultipleFiles = useDriveIntegrationStore((state) => state.uploadMultipleFiles);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList | File[]) => {
        const validFiles: File[] = [];
        const errors: string[] = [];

        Array.from(files).forEach((file) => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                errors.push(`${file.name}: Unsupported format`);
            } else if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name}: Exceeds 25MB limit`);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            setError(errors.join(', '));
        } else {
            setError('');
        }

        setSelectedFiles((prev) => [...prev, ...validFiles]);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleRemoveFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setProgress(0);
        setError('');

        try {
            await uploadMultipleFiles(connectionId, folderId, selectedFiles);
            setSelectedFiles([]);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to upload files');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const handleClose = () => {
        if (uploading) return;
        setSelectedFiles([]);
        setError('');
        onClose();
    };

    const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
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
                <UploadIcon color="primary" />
                Upload Photos
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                        {error}
                    </Alert>
                )}

                {/* Drop zone */}
                <Box
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                        mt: 1,
                        p: 4,
                        borderRadius: '16px',
                        border: '2px dashed',
                        borderColor: isDragOver ? '#9D4EDD' : 'rgba(255,255,255,0.1)',
                        background: isDragOver
                            ? alpha('#9D4EDD', 0.06)
                            : 'rgba(255,255,255,0.02)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderColor: 'rgba(157, 78, 221, 0.3)',
                            background: alpha('#9D4EDD', 0.04),
                        },
                    }}
                >
                    <ImageIcon sx={{ fontSize: 40, color: '#64748B', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 0.5 }}>
                        Drop photos here or <span style={{ color: '#C084FC', fontWeight: 600 }}>browse</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569' }}>
                        JPG, PNG, WebP, GIF, HEIC • Max 25MB per file
                    </Typography>
                </Box>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_TYPES.join(',')}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        if (e.target.files) {
                            handleFileSelect(e.target.files);
                            e.target.value = '';
                        }
                    }}
                />

                {/* Selected files */}
                {selectedFiles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '13px' }}>
                                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
                                {formatSize(totalSize)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selectedFiles.map((file, index) => (
                                <Chip
                                    key={`${file.name}-${index}`}
                                    label={file.name}
                                    size="small"
                                    onDelete={uploading ? undefined : () => handleRemoveFile(index)}
                                    deleteIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
                                    sx={{
                                        fontSize: '11px',
                                        height: 26,
                                        maxWidth: 200,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Upload progress */}
                {uploading && (
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress
                            variant="indeterminate"
                            sx={{
                                borderRadius: '4px',
                                bgcolor: 'rgba(255,255,255,0.04)',
                                '& .MuiLinearProgress-bar': {
                                    background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
                                },
                            }}
                        />
                        <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block' }}>
                            Uploading to Google Drive...
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}>
                <Button
                    onClick={handleClose}
                    disabled={uploading}
                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleUpload}
                    variant="contained"
                    disabled={uploading || selectedFiles.length === 0}
                    startIcon={<UploadIcon />}
                    sx={{ borderRadius: '8px', fontWeight: 600, px: 3 }}
                >
                    {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DriveUploadDialog;
