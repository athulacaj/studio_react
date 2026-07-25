import React, { useState, useMemo, useEffect } from 'react';
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
    Chip,
} from '@mui/material';
import {
    FolderOpen as FolderOpenIcon,
    CloudUpload as UploadIcon,
    CheckCircle as CheckCircleIcon,
    ErrorOutline as ErrorIcon,
    Replay as ResumeIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { useDriveIntegrationStore } from '../store/driveIntegrationStore';
import { isFileSystemAccessSupported } from '../services/fileIndexService';
import { driveIndexedDBService } from '../services/driveIndexedDBService';

interface ProjectFolderUploadProps {
    open: boolean;
    onClose: () => void;
    connectionId: string;
    studioUserId: string;
    projectId: string;
    /** Drive folder to upload into (current browse folder). */
    baseFolderId: string;
}

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

type DialogPhase = 'idle' | 'scanning' | 'indexed' | 'uploading' | 'complete' | 'error';

const ProjectFolderUpload: React.FC<ProjectFolderUploadProps> = ({
    open,
    onClose,
    connectionId,
    studioUserId,
    projectId,
    baseFolderId,
}) => {
    const {
        scanning,
        syncing,
        indexedFiles,
        selectedFolderName,
        folderUploadProgress,
        scanProgress,
        error: storeError,
        selectProjectFolder,
        refreshProjectFolder,
        startUploadTask,
        resumeUploadTask,
    } = useDriveIntegrationStore();

    const [result, setResult] = useState<{ uploaded: number; failed: number } | null>(null);
    const [localError, setLocalError] = useState('');
    const [hasResumable, setHasResumable] = useState(false);

    const isSupported = isFileSystemAccessSupported();

    // Check for resumable uploads on dialog open
    useEffect(() => {
        if (open && projectId) {
            driveIndexedDBService
                .getFilesByStatus(projectId, 'NOT_UPLOADED')
                .then((pending) => setHasResumable(pending.length > 0))
                .catch(() => setHasResumable(false));
        }
    }, [open, projectId]);

    // Determine current phase
    const phase: DialogPhase = useMemo(() => {
        if (result) return 'complete';
        if (storeError || localError) return 'error';
        if (syncing) return 'uploading';
        if (scanning) return 'scanning';
        if (indexedFiles.length > 0) return 'indexed';
        return 'idle';
    }, [result, storeError, localError, syncing, scanning, indexedFiles.length]);

    // Computed stats
    const stats = useMemo(() => {
        const total = indexedFiles.length;
        const notUploaded = indexedFiles.filter((f) => f.status === 'NOT_UPLOADED').length;
        const uploaded = indexedFiles.filter((f) => f.status === 'UPLOADED').length;
        const failed = indexedFiles.filter((f) => f.status === 'FAILED').length;
        const totalSize = indexedFiles.reduce((sum, f) => sum + f.size, 0);
        return { total, notUploaded, uploaded, failed, totalSize };
    }, [indexedFiles]);

    const progressPct =
        folderUploadProgress && folderUploadProgress.total > 0
            ? Math.round((folderUploadProgress.completed / folderUploadProgress.total) * 100)
            : 0;

    const resetState = () => {
        setResult(null);
        setLocalError('');
    };

    const handleClose = () => {
        if (syncing || scanning) return;
        resetState();
        onClose();
    };

    const handleSelectFolder = async () => {
        resetState();
        try {
            await selectProjectFolder(studioUserId, projectId, connectionId);
        } catch {
            // Error is handled by the store
        }
    };

    const handleRefreshFolder = async () => {
        resetState();
        try {
            await refreshProjectFolder(projectId);
        } catch {
            // Error is handled by the store
        }
    };

    const handleStartUpload = async () => {
        setLocalError('');
        try {
            const res = await startUploadTask(projectId, connectionId, baseFolderId);
            setResult(res);
        } catch (err: any) {
            setLocalError(err?.message || 'Upload failed.');
        }
    };

    const handleResume = async () => {
        setLocalError('');
        try {
            const res = await resumeUploadTask(projectId, connectionId, baseFolderId);
            setResult(res);
        } catch (err: any) {
            setLocalError(err?.message || 'Resume failed.');
        }
    };

    const errorMsg = localError || storeError || '';

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
                <FolderOpenIcon color="primary" />
                Upload from Folder
            </DialogTitle>
            <DialogContent>
                {/* Browser compatibility warning */}
                {!isSupported && (
                    <Alert
                        severity="warning"
                        icon={<InfoIcon />}
                        sx={{ mb: 2, borderRadius: '12px' }}
                    >
                        The File System Access API is not supported in your browser.
                        Please use <strong>Google Chrome</strong>, Edge, or another Chromium-based browser.
                    </Alert>
                )}

                {/* Error */}
                {errorMsg && phase === 'error' && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                        {errorMsg}
                    </Alert>
                )}

                {/* ───── COMPLETE ───── */}
                {phase === 'complete' && result && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <CheckCircleIcon sx={{ fontSize: 56, color: '#22C55E', mb: 1.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#F8FAFC', mb: 0.5 }}>
                            Upload Complete
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            {result.uploaded} photo{result.uploaded !== 1 ? 's' : ''} uploaded
                            {result.failed > 0 && (
                                <span style={{ color: '#F87171' }}>
                                    {' '}• {result.failed} failed
                                </span>
                            )}
                        </Typography>
                    </Box>
                )}

                {/* ───── IDLE / PICK FOLDER ───── */}
                {phase === 'idle' && isSupported && (
                    <>
                        <Box
                            onClick={handleSelectFolder}
                            sx={{
                                mt: 1,
                                p: 4,
                                borderRadius: '16px',
                                border: '2px dashed rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.02)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: 'rgba(157, 78, 221, 0.3)',
                                    background: alpha('#9D4EDD', 0.04),
                                },
                            }}
                        >
                            <FolderOpenIcon sx={{ fontSize: 48, color: '#64748B', mb: 1 }} />
                            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 0.5 }}>
                                Click to{' '}
                                <span style={{ color: '#C084FC', fontWeight: 600 }}>
                                    select a project folder
                                </span>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#475569' }}>
                                All photos inside (including subfolders) will be indexed and uploaded to Drive
                            </Typography>
                        </Box>

                        {/* Resume banner */}
                        {hasResumable && (
                            <Alert
                                severity="info"
                                icon={<ResumeIcon />}
                                sx={{ mt: 2, borderRadius: '12px' }}
                                action={
                                    <Button
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        onClick={handleResume}
                                        sx={{ borderRadius: '8px', fontWeight: 600, textTransform: 'none' }}
                                    >
                                        Resume
                                    </Button>
                                }
                            >
                                You have pending uploads from a previous session.
                            </Alert>
                        )}
                    </>
                )}

                {/* ───── ERROR (with retry) ───── */}
                {phase === 'error' && isSupported && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <ErrorIcon sx={{ fontSize: 48, color: '#F87171', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                            Something went wrong. You can try again.
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<FolderOpenIcon />}
                            onClick={handleSelectFolder}
                            sx={{
                                borderRadius: '10px',
                                borderColor: 'rgba(255,255,255,0.1)',
                                color: '#C084FC',
                                fontWeight: 600,
                                textTransform: 'none',
                            }}
                        >
                            Select Folder Again
                        </Button>
                    </Box>
                )}

                {/* ───── SCANNING ───── */}
                {phase === 'scanning' && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={40} sx={{ color: '#C084FC', mb: 2 }} />
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                            {scanProgress?.found ? `Found ${scanProgress.found} images…` : 'Scanning folder for images…'}
                        </Typography>
                        {scanProgress?.currentDir && (
                            <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5 }}>
                                {scanProgress.currentDir}
                            </Typography>
                        )}
                    </Box>
                )}

                {/* ───── INDEXED / READY ───── */}
                {phase === 'indexed' && (
                    <>
                        {/* Folder name */}
                        <Box
                            sx={{
                                mt: 1,
                                p: 2,
                                borderRadius: '14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                            }}
                        >
                            <FolderOpenIcon sx={{ color: '#F59E0B' }} />
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
                                    {selectedFolderName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                    Folder indexed successfully
                                </Typography>
                            </Box>
                            <Chip
                                label="Ready"
                                size="small"
                                sx={{
                                    ml: 'auto',
                                    fontSize: '11px',
                                    height: 22,
                                    background: alpha('#22C55E', 0.1),
                                    color: '#22C55E',
                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                }}
                            />
                        </Box>

                        {/* Stats grid */}
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
                            <Stat label="Total photos" value={String(stats.total)} />
                            <Stat label="To upload" value={String(stats.notUploaded)} accent="#C084FC" />
                            <Stat label="Already uploaded" value={String(stats.uploaded)} />
                            <Stat label="Total size" value={formatSize(stats.totalSize)} />
                        </Box>

                        {stats.notUploaded === 0 && (
                            <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                                All photos have already been uploaded.
                            </Alert>
                        )}
                    </>
                )}

                {/* ───── UPLOADING ───── */}
                {phase === 'uploading' && folderUploadProgress && (
                    <Box sx={{ mt: 1 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: '14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                mb: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
                                    Uploading to Google Drive
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
                                    {folderUploadProgress.completed}/{folderUploadProgress.total}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant={folderUploadProgress.total > 0 ? 'determinate' : 'indeterminate'}
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
                            <Typography
                                variant="caption"
                                sx={{ color: '#94A3B8', mt: 0.75, display: 'block' }}
                                noWrap
                            >
                                {folderUploadProgress.currentFile
                                    ? `Uploading ${folderUploadProgress.currentFile}`
                                    : 'Preparing…'}
                            </Typography>
                            {folderUploadProgress.failed > 0 && (
                                <Typography
                                    variant="caption"
                                    sx={{ color: '#F87171', mt: 0.5, display: 'block' }}
                                >
                                    {folderUploadProgress.failed} file{folderUploadProgress.failed !== 1 ? 's' : ''} failed
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}>
                <Button
                    onClick={handleClose}
                    disabled={syncing || scanning}
                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                >
                    {phase === 'complete' ? 'Close' : 'Cancel'}
                </Button>

                {phase === 'indexed' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={handleRefreshFolder}
                            variant="outlined"
                            startIcon={<ResumeIcon />}
                            sx={{ borderRadius: '8px', fontWeight: 600, px: 2, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                            Refresh Folder
                        </Button>
                        {stats.notUploaded > 0 && (
                            <Button
                                onClick={handleStartUpload}
                                variant="contained"
                                startIcon={<UploadIcon />}
                                sx={{ borderRadius: '8px', fontWeight: 600, px: 3 }}
                            >
                                Sync {stats.notUploaded} Photo{stats.notUploaded !== 1 ? 's' : ''}
                            </Button>
                        )}
                    </Box>
                )}

                {phase === 'idle' && isSupported && !hasResumable && (
                    <Button
                        onClick={handleSelectFolder}
                        variant="contained"
                        startIcon={<FolderOpenIcon />}
                        sx={{ borderRadius: '8px', fontWeight: 600, px: 3 }}
                    >
                        Select Folder
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

// ─── Stat mini-component ──────────────────────────────────────────────────────
const Stat: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => (
    <Box sx={{ minWidth: 70 }}>
        <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: accent || '#F8FAFC', fontSize: '18px', lineHeight: 1.1 }}
        >
            {value}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
            {label}
        </Typography>
    </Box>
);

export default ProjectFolderUpload;
