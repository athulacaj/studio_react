import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Paper,
    Breadcrumbs,
    Link,
    Skeleton,
    Tooltip,
    Chip,
    alpha,
    Grid,
    Alert,
} from '@mui/material';
import {
    Folder as FolderIcon,
    InsertDriveFile as FileIcon,
    Image as ImageIcon,
    CreateNewFolder as NewFolderIcon,
    CloudUpload as UploadIcon,
    DriveFolderUpload as FolderUploadIcon,
    Refresh as RefreshIcon,
    NavigateNext as NavNextIcon,
    LinkOff as UnlinkIcon,
    Google as GoogleIcon,
    Link as LinkIcon,
    ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useDriveIntegrationStore } from '../store/driveIntegrationStore';
import type { DriveFileItem } from '../types';
import CreateDriveFolderDialog from './CreateDriveFolderDialog';
import DriveUploadDialog from './DriveUploadDialog';
import DriveFolderUploadDialog from './DriveFolderUploadDialog';

interface DriveFileBrowserProps {
    studioUserId: string;
    projectId: string;
}

/**
 * Google-Drive-like file browser for the admin to manage files
 * in the client's connected Drive folder.
 */
const DriveFileBrowser: React.FC<DriveFileBrowserProps> = ({ studioUserId, projectId }) => {
    const {
        activeConnection,
        currentFiles,
        breadcrumbs,
        currentFolderId,
        loading,
        uploading,
        syncing,
        error,
        fetchConnection,
        navigateToFolder,
        navigateToBreadcrumb,
        listContents,
        revokeAccess,
    } = useDriveIntegrationStore();

    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [folderUploadOpen, setFolderUploadOpen] = useState(false);
    const [confirmUnlink, setConfirmUnlink] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    useEffect(() => {
        fetchConnection(studioUserId, projectId);
    }, [studioUserId, projectId, fetchConnection]);

    const handleFolderClick = (item: DriveFileItem) => {
        if (item.isFolder) {
            navigateToFolder(item.id, item.name);
        }
    };

    const handleRefresh = () => {
        if (activeConnection && currentFolderId) {
            listContents(activeConnection.id, currentFolderId);
        }
    };

    const handleUnlink = async () => {
        if (activeConnection) {
            await revokeAccess(activeConnection.id);
            setConfirmUnlink(false);
        }
    };

    const getFileIcon = (item: DriveFileItem) => {
        if (item.isFolder) {
            return <FolderIcon sx={{ fontSize: 40, color: '#F59E0B' }} />;
        }
        if (item.mimeType?.startsWith('image/')) {
            return <ImageIcon sx={{ fontSize: 40, color: '#38BDF8' }} />;
        }
        return <FileIcon sx={{ fontSize: 40, color: '#94A3B8' }} />;
    };

    const formatFileSize = (size?: string) => {
        if (!size) return '';
        const bytes = parseInt(size, 10);
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Separate folders and files
    const folders = currentFiles.filter((f) => f.isFolder);
    const files = currentFiles.filter((f) => !f.isFolder);

    // No connection state — show a prominent shareable link
    if (!loading && !activeConnection) {
        const connectUrl = `${window.location.origin}/drive/connect/${studioUserId}/${projectId}`;

        const handleCopyConnectLink = () => {
            navigator.clipboard.writeText(connectUrl);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2500);
        };

        return (
            <Paper
                sx={{
                    p: 4,
                    borderRadius: '20px',
                    background: 'rgba(15, 26, 46, 0.72)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        border: '1px solid rgba(157, 78, 221, 0.15)',
                    }}
                >
                    <GoogleIcon sx={{ fontSize: 32, color: '#C084FC' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#F8FAFC', mb: 1 }}>
                    No Drive Connected
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, maxWidth: 420, mx: 'auto', lineHeight: 1.6 }}>
                    Share the link below with your client. They'll sign in with their Google account and link their Drive — it's a one-time process.
                </Typography>

                {/* Copyable URL field */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        pl: 2,
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        maxWidth: 520,
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    <LinkIcon sx={{ fontSize: 18, color: '#64748B', flexShrink: 0 }} />
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#94A3B8',
                            fontSize: '13px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            textAlign: 'left',
                            userSelect: 'all',
                        }}
                    >
                        {connectUrl}
                    </Typography>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={handleCopyConnectLink}
                        startIcon={<CopyIcon sx={{ fontSize: '16px !important' }} />}
                        sx={{
                            borderRadius: '10px',
                            background: linkCopied
                                ? 'linear-gradient(90deg, #059669 0%, #10B981 100%)'
                                : 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                            fontWeight: 600,
                            fontSize: '12px',
                            px: 2,
                            py: 0.7,
                            minWidth: 90,
                            textTransform: 'none',
                            boxShadow: linkCopied
                                ? '0 0 16px rgba(16, 185, 129, 0.3)'
                                : '0 0 16px rgba(157, 78, 221, 0.25)',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                                background: linkCopied
                                    ? 'linear-gradient(90deg, #047857 0%, #059669 100%)'
                                    : 'linear-gradient(90deg, #6D28D9 0%, #9D4EDD 100%)',
                            },
                        }}
                    >
                        {linkCopied ? 'Copied!' : 'Copy Link'}
                    </Button>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                borderRadius: '20px',
                background: 'rgba(15, 26, 46, 0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <GoogleIcon sx={{ color: '#C084FC', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px' }}>
                        Drive Storage
                    </Typography>
                    {activeConnection && (
                        <Chip
                            label={activeConnection.googleEmail}
                            size="small"
                            sx={{
                                fontSize: '11px',
                                height: 24,
                                background: alpha('#22C55E', 0.1),
                                color: '#22C55E',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                            }}
                        />
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Create Folder">
                        <IconButton
                            size="small"
                            onClick={() => setCreateFolderOpen(true)}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#C084FC' } }}
                        >
                            <NewFolderIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Upload Photos">
                        <IconButton
                            size="small"
                            onClick={() => setUploadOpen(true)}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#C084FC' } }}
                        >
                            <UploadIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Upload Folder">
                        <IconButton
                            size="small"
                            onClick={() => setFolderUploadOpen(true)}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#C084FC' } }}
                        >
                            <FolderUploadIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <IconButton
                            size="small"
                            onClick={handleRefresh}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#C084FC' } }}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Unlink Drive">
                        <IconButton
                            size="small"
                            onClick={() => setConfirmUnlink(true)}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
                        >
                            <UnlinkIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Unlink confirmation */}
            {confirmUnlink && (
                <Alert
                    severity="warning"
                    sx={{
                        mx: 2,
                        mt: 2,
                        borderRadius: '12px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                    }}
                    action={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" color="inherit" onClick={() => setConfirmUnlink(false)}>
                                Cancel
                            </Button>
                            <Button size="small" color="warning" variant="outlined" onClick={handleUnlink}>
                                Unlink
                            </Button>
                        </Box>
                    }
                >
                    Are you sure you want to unlink this Google Drive? Files will remain in the Drive.
                </Alert>
            )}

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <Breadcrumbs separator={<NavNextIcon sx={{ fontSize: 16, color: '#475569' }} />}>
                        {breadcrumbs.map((crumb, index) => (
                            <Link
                                key={crumb.id}
                                component="button"
                                variant="body2"
                                onClick={() => navigateToBreadcrumb(index)}
                                sx={{
                                    color: index === breadcrumbs.length - 1 ? '#C084FC' : '#94A3B8',
                                    fontWeight: index === breadcrumbs.length - 1 ? 600 : 400,
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    '&:hover': { color: '#C084FC' },
                                }}
                            >
                                {crumb.name}
                            </Link>
                        ))}
                    </Breadcrumbs>
                </Box>
            )}

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mx: 2, mt: 2, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}

            {/* Content area */}
            <Box sx={{ p: 2, minHeight: 200 }}>
                {loading ? (
                    <Grid container spacing={1.5}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
                                <Skeleton
                                    variant="rounded"
                                    height={100}
                                    sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.04)' }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : folders.length === 0 && files.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <FolderIcon sx={{ fontSize: 48, color: '#475569', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#64748B' }}>
                            This folder is empty
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<NewFolderIcon />}
                                onClick={() => setCreateFolderOpen(true)}
                                sx={{
                                    borderRadius: '12px',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: '#C084FC',
                                    fontSize: '12px',
                                }}
                            >
                                New Folder
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<UploadIcon />}
                                onClick={() => setUploadOpen(true)}
                                sx={{
                                    borderRadius: '12px',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: '#C084FC',
                                    fontSize: '12px',
                                }}
                            >
                                Upload Photos
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<FolderUploadIcon />}
                                onClick={() => setFolderUploadOpen(true)}
                                sx={{
                                    borderRadius: '12px',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: '#C084FC',
                                    fontSize: '12px',
                                }}
                            >
                                Upload Folder
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Grid container spacing={1.5}>
                        {/* Folders first */}
                        {folders.map((item) => (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={item.id}>
                                <Box
                                    onClick={() => handleFolderClick(item)}
                                    sx={{
                                        p: 2,
                                        borderRadius: '14px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 1,
                                        '&:hover': {
                                            background: 'rgba(157, 78, 221, 0.06)',
                                            borderColor: 'rgba(157, 78, 221, 0.15)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                        },
                                    }}
                                >
                                    {getFileIcon(item)}
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: '#F8FAFC',
                                            textAlign: 'center',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: 1.3,
                                            width: '100%',
                                        }}
                                    >
                                        {item.name}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                        {/* Files */}
                        {files.map((item) => (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={item.id}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: '14px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 1,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            background: 'rgba(255,255,255,0.04)',
                                        },
                                    }}
                                >
                                    {item.thumbnailLink ? (
                                        <Box
                                            component="img"
                                            src={item.thumbnailLink}
                                            alt={item.name}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '8px',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    ) : (
                                        getFileIcon(item)
                                    )}
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: '11px',
                                            color: '#94A3B8',
                                            textAlign: 'center',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: 1.3,
                                            width: '100%',
                                        }}
                                    >
                                        {item.name}
                                    </Typography>
                                    {item.size && (
                                        <Typography variant="caption" sx={{ color: '#475569', fontSize: '10px' }}>
                                            {formatFileSize(item.size)}
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Uploading overlay */}
            {(uploading || syncing) && (
                <Box
                    sx={{
                        px: 3,
                        py: 1.5,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        background: alpha('#9D4EDD', 0.06),
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#9D4EDD',
                            animation: 'pulse 1.5s ease-in-out infinite',
                            '@keyframes pulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.3 },
                            },
                        }}
                    />
                    <Typography variant="body2" sx={{ color: '#C084FC', fontSize: '13px', fontWeight: 500 }}>
                        {syncing ? 'Syncing folder to Drive...' : 'Uploading photos...'}
                    </Typography>
                </Box>
            )}

            {/* Dialogs */}
            {activeConnection && currentFolderId && (
                <>
                    <CreateDriveFolderDialog
                        open={createFolderOpen}
                        onClose={() => setCreateFolderOpen(false)}
                        connectionId={activeConnection.id}
                        parentFolderId={currentFolderId}
                    />
                    <DriveUploadDialog
                        open={uploadOpen}
                        onClose={() => setUploadOpen(false)}
                        connectionId={activeConnection.id}
                        folderId={currentFolderId}
                    />
                    <DriveFolderUploadDialog
                        open={folderUploadOpen}
                        onClose={() => setFolderUploadOpen(false)}
                        connectionId={activeConnection.id}
                        baseFolderId={currentFolderId}
                    />
                </>
            )}
        </Paper>
    );
};

export default DriveFileBrowser;
