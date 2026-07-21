import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    CircularProgress,
    alpha,
} from '@mui/material';
import {
    DriveFolderUpload as FolderUploadIcon,
    CheckCircle as CheckCircleIcon,
    FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { useDriveIntegrationStore } from '../store/driveIntegrationStore';
import {
    isImageFile,
    fileRelPath,
    topFolderName,
    countSubfolders,
} from '../utils';

interface DriveFolderUploadDialogProps {
    open: boolean;
    onClose: () => void;
    connectionId: string;
    /** The Drive folder the picked tree will be mirrored under (current browse folder). */
    baseFolderId: string;
}

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const DriveFolderUploadDialog: React.FC<DriveFolderUploadDialogProps> = ({
    open,
    onClose,
    connectionId,
    baseFolderId,
}) => {
    const syncFolder = useDriveIntegrationStore((s) => s.syncFolder);
    const fetchManifest = useDriveIntegrationStore((s) => s.fetchManifest);
    const syncing = useDriveIntegrationStore((s) => s.syncing);
    const syncProgress = useDriveIntegrationStore((s) => s.syncProgress);

    const [images, setImages] = useState<File[]>([]);
    const [alreadySynced, setAlreadySynced] = useState<Set<string>>(new Set());
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ uploaded: number; skipped: number } | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // `<input webkitdirectory>` isn't a typed React attribute — set it imperatively.
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.setAttribute('webkitdirectory', '');
            inputRef.current.setAttribute('directory', '');
            inputRef.current.setAttribute('mozdirectory', '');
        }
    }, [open]);

    const resetState = () => {
        setImages([]);
        setAlreadySynced(new Set());
        setError('');
        setResult(null);
        setScanning(false);
    };

    const handleClose = () => {
        if (syncing) return;
        resetState();
        onClose();
    };

    const handleFolderSelect = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        setError('');
        setResult(null);
        setScanning(true);

        const all = Array.from(fileList);
        const imageFiles = all.filter(isImageFile);

        if (imageFiles.length === 0) {
            setImages([]);
            setError('No supported image files were found in that folder.');
            setScanning(false);
            return;
        }

        setImages(imageFiles);

        // Compare against the manifest to preview how many are new.
        try {
            const synced = await fetchManifest(connectionId);
            setAlreadySynced(new Set(synced.map((f) => f.relativePath)));
        } catch {
            setAlreadySynced(new Set());
        } finally {
            setScanning(false);
        }
    };

    const stats = useMemo(() => {
        const totalSize = images.reduce((sum, f) => sum + f.size, 0);
        const newCount = images.filter((f) => !alreadySynced.has(fileRelPath(f))).length;
        return {
            total: images.length,
            newCount,
            skippedCount: images.length - newCount,
            totalSize,
            subfolders: countSubfolders(images),
            folderName: topFolderName(images),
        };
    }, [images, alreadySynced]);

    const handleUpload = async () => {
        if (images.length === 0) return;
        setError('');
        try {
            const res = await syncFolder(connectionId, baseFolderId, images);
            setResult(res);
        } catch (err: any) {
            setError(err?.message || 'Failed to sync the folder to Google Drive.');
        }
    };

    const progressPct =
        syncProgress && syncProgress.total > 0
            ? Math.round((syncProgress.completed / syncProgress.total) * 100)
            : 0;

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
                <FolderUploadIcon color="primary" />
                Upload a Folder
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                        {error}
                    </Alert>
                )}

                {/* Success summary */}
                {result ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <CheckCircleIcon sx={{ fontSize: 56, color: '#22C55E', mb: 1.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#F8FAFC', mb: 0.5 }}>
                            Sync complete
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            {result.uploaded} photo{result.uploaded !== 1 ? 's' : ''} uploaded
                            {result.skipped > 0 && ` • ${result.skipped} already in Drive (skipped)`}
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Picker */}
                        <Box
                            onClick={() => !syncing && inputRef.current?.click()}
                            sx={{
                                mt: 1,
                                p: 4,
                                borderRadius: '16px',
                                border: '2px dashed rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.02)',
                                textAlign: 'center',
                                cursor: syncing ? 'default' : 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': syncing
                                    ? {}
                                    : {
                                          borderColor: 'rgba(157, 78, 221, 0.3)',
                                          background: alpha('#9D4EDD', 0.04),
                                      },
                            }}
                        >
                            <FolderOpenIcon sx={{ fontSize: 40, color: '#64748B', mb: 1 }} />
                            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 0.5 }}>
                                {scanning ? (
                                    'Scanning folder…'
                                ) : images.length > 0 ? (
                                    <>
                                        Selected <span style={{ color: '#C084FC', fontWeight: 600 }}>{stats.folderName}</span>
                                    </>
                                ) : (
                                    <>
                                        Click to <span style={{ color: '#C084FC', fontWeight: 600 }}>choose a folder</span>
                                    </>
                                )}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#475569' }}>
                                All photos inside (including subfolders) will be synced to Drive
                            </Typography>
                        </Box>

                        <input
                            ref={inputRef}
                            type="file"
                            multiple
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                handleFolderSelect(e.target.files);
                                e.target.value = '';
                            }}
                        />

                        {/* Preview stats */}
                        {images.length > 0 && !scanning && (
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    borderRadius: '14px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Stat label="Photos found" value={String(stats.total)} />
                                <Stat label="New to upload" value={String(stats.newCount)} accent="#C084FC" />
                                <Stat label="Already synced" value={String(stats.skippedCount)} />
                                <Stat label="Subfolders" value={String(stats.subfolders)} />
                                <Stat label="Total size" value={formatSize(stats.totalSize)} />
                            </Box>
                        )}

                        {stats.newCount === 0 && images.length > 0 && !scanning && (
                            <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                                Every photo in this folder has already been synced.
                            </Alert>
                        )}

                        {/* Progress */}
                        {syncing && syncProgress && (
                            <Box sx={{ mt: 2 }}>
                                <LinearProgress
                                    variant={syncProgress.total > 0 ? 'determinate' : 'indeterminate'}
                                    value={progressPct}
                                    sx={{
                                        borderRadius: '4px',
                                        height: 6,
                                        bgcolor: 'rgba(255,255,255,0.04)',
                                        '& .MuiLinearProgress-bar': {
                                            background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
                                        },
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
                                    <Typography variant="caption" sx={{ color: '#94A3B8' }} noWrap>
                                        {syncProgress.currentFile
                                            ? `Uploading ${syncProgress.currentFile}`
                                            : 'Preparing…'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                                        {syncProgress.completed}/{syncProgress.total}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}>
                <Button
                    onClick={handleClose}
                    disabled={syncing}
                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                >
                    {result ? 'Close' : 'Cancel'}
                </Button>
                {!result && (
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={syncing || scanning || stats.newCount === 0}
                        startIcon={
                            syncing ? <CircularProgress size={16} color="inherit" /> : <FolderUploadIcon />
                        }
                        sx={{ borderRadius: '8px', fontWeight: 600, px: 3 }}
                    >
                        {syncing
                            ? 'Syncing…'
                            : stats.newCount > 0
                            ? `Upload ${stats.newCount} Photo${stats.newCount !== 1 ? 's' : ''}`
                            : 'Upload'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

const Stat: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => (
    <Box sx={{ minWidth: 70 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: accent || '#F8FAFC', fontSize: '18px', lineHeight: 1.1 }}>
            {value}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
            {label}
        </Typography>
    </Box>
);

export default DriveFolderUploadDialog;
