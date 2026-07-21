import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Chip,
    IconButton,
    Snackbar,
    Alert,
    Tooltip,
    Divider,
    Skeleton,
    alpha,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Share as ShareIcon,
    ContentCopy as CopyIcon,
    Google as GoogleIcon,
    Cloud as CloudIcon,
    OpenInNew as OpenInNewIcon,
    CalendarToday as CalendarIcon,
    Folder as FolderIcon,
    Link as LinkIcon,
    Article as ArticleIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { useStudioManagementStore } from '../store/studioManagementStore';
import { useAuthStore } from '../../auth';
import { useUserStore } from '../../auth';
import CreateProjectModal from '../components/CreateProjectModal';
import ManageShareLinksModal from '../components/ManageShareLinksModal';
import { useToastStore } from '../../../shared/hooks/useToastStore';
import { DriveFileBrowser, useDriveIntegrationStore } from '../../drive-integration';

const ProjectDetailView: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.currentUser);
    const projects = useStudioManagementStore((state) => state.projects);
    const loading = useStudioManagementStore((state) => state.loading);
    const viewAsUserId = useStudioManagementStore((state) => state.viewAsUserId);
    const { userProfile } = useUserStore();

    // When admin is viewing another user, use that user's ID for links
    const effectiveUserId = viewAsUserId || currentUser?.uid;
    const isAdminViewing = !!viewAsUserId && userProfile?.isAdmin;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [driveConnectLinkCopied, setDriveConnectLinkCopied] = useState(false);
    const showToast = useToastStore((state) => state.showToast);

    // Drive connection state
    const activeConnection = useDriveIntegrationStore((state) => state.activeConnection);
    const driveLoading = useDriveIntegrationStore((state) => state.loading);
    const fetchConnection = useDriveIntegrationStore((state) => state.fetchConnection);

    const project = useMemo(
        () => projects.find((p) => p.id === projectId) || null,
        [projects, projectId]
    );

    // Fetch Drive connection for google_photos projects
    useEffect(() => {
        if (project?.source === 'google_photos' && effectiveUserId && project.id) {
            fetchConnection(effectiveUserId, project.id);
        }
    }, [project?.source, project?.id, effectiveUserId, fetchConnection]);

    const handleCopyLink = () => {
        if (!effectiveUserId || !project) return;
        const link = `${window.location.origin}/view/${effectiveUserId}/${project.id}`;
        navigator.clipboard.writeText(link);
        showToast('Project link copied to clipboard!', 'success');
    };

    const handleOpenDriveUrl = () => {
        if (project?.driveUrl) {
            window.open(project.driveUrl, '_blank');
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    if (loading && !project) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width={300} height={48} />
                </Box>
                <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
            </Container>
        );
    }

    if (!project) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    <Typography variant="h6">Project not found</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        The project you are looking for does not exist or has been deleted.
                    </Typography>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(isAdminViewing ? `/private/admin/user/${viewAsUserId}` : '/private/studio')}
                        sx={{ mt: 2 }}
                    >
                        Back to Projects
                    </Button>
                </Alert>
            </Container>
        );
    }

    const formattedDate = project.createdAt?.toDate
        ? project.createdAt.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'Just now';

    const formattedUpdatedDate = project.updatedAt?.toDate
        ? project.updatedAt.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : null;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ── Top Bar: Back + Project Name + Actions ── */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    px: 3,
                    mb: 4,
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                }}
            >
                {/* Left side: Back button + Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                    <Tooltip title={isAdminViewing ? 'Back to user dashboard' : 'Back to projects'}>
                        <IconButton
                            onClick={() => navigate(isAdminViewing ? `/private/admin/user/${viewAsUserId}` : '/private/studio')}
                            sx={{
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                },
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            noWrap
                            sx={{ maxWidth: { xs: 200, sm: 400, md: 500 } }}
                        >
                            {project.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                                icon={
                                    project.source === 'google_photos' ? (
                                        <GoogleIcon sx={{ fontSize: 16 }} />
                                    ) : (
                                        <CloudIcon sx={{ fontSize: 16 }} />
                                    )
                                }
                                label={
                                    project.source === 'google_photos'
                                        ? 'Google Photos'
                                        : 'Google Drive'
                                }
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                            />
                            <Chip
                                label={project.status}
                                size="small"
                                color={project.status === 'active' ? 'success' : 'default'}
                                sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Right side: Action buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' }, mt: { xs: 2, sm: 0 }, justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
                    <Tooltip title="Edit project">
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditModalOpen(true)}
                            size="small"
                            sx={{
                                flex: { xs: 1, sm: 'initial' },
                                borderRadius: 2,
                                borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: (theme) =>
                                        alpha(theme.palette.primary.main, 0.08),
                                },
                            }}
                        >
                            Edit
                        </Button>
                    </Tooltip>

                    <Tooltip title="Manage shareable links">
                        <Button
                            variant="outlined"
                            startIcon={<ShareIcon />}
                            onClick={() => setIsShareModalOpen(true)}
                            size="small"
                            sx={{
                                flex: { xs: 1, sm: 'initial' },
                                borderRadius: 2,
                                borderColor: (theme) => alpha(theme.palette.secondary.main, 0.3),
                                color: 'secondary.main',
                                '&:hover': {
                                    borderColor: 'secondary.main',
                                    backgroundColor: (theme) =>
                                        alpha(theme.palette.secondary.main, 0.08),
                                },
                            }}
                        >
                            Share
                        </Button>
                    </Tooltip>

                    <Tooltip title="Copy project link">
                        <IconButton
                            onClick={handleCopyLink}
                            size="small"
                            sx={{
                                flex: { xs: 'none', sm: 'initial' },
                                backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1),
                                '&:hover': {
                                    backgroundColor: (theme) => alpha(theme.palette.info.main, 0.2),
                                },
                            }}
                        >
                            <CopyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Paper>

            {/* ── Project Details ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Info Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}
                    >
                        Project Details
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        {/* Created Date */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <CalendarIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Created
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {formattedDate}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Updated Date */}
                        {formattedUpdatedDate && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CalendarIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Last Updated
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {formattedUpdatedDate}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Selected Folders Count */}
                        {project.selectedFolders && project.selectedFolders.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <FolderIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Synced Folders
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {project.selectedFolders.length} folder
                                        {project.selectedFolders.length !== 1 ? 's' : ''}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Drive URL */}
                    {project.driveUrl && (
                        <>
                            <Divider sx={{ my: 2.5 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <LinkIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Source URL
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        noWrap
                                        sx={{
                                            maxWidth: '100%',
                                            color: 'primary.main',
                                            cursor: 'pointer',
                                            '&:hover': { textDecoration: 'underline' },
                                        }}
                                        onClick={handleOpenDriveUrl}
                                    >
                                        {project.driveUrl}
                                    </Typography>
                                </Box>
                                <Tooltip title="Open in new tab">
                                    <IconButton size="small" onClick={handleOpenDriveUrl}>
                                        <OpenInNewIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </>
                    )}

                    {/* Google Drive Connection Status (for google_photos source) */}
                    {project.source === 'google_photos' && (
                        <>
                            <Divider sx={{ my: 2.5 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <GoogleIcon sx={{ color: activeConnection ? '#22C55E' : 'text.secondary', fontSize: 20 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Google Drive Connection
                                    </Typography>
                                    {driveLoading ? (
                                        <Skeleton variant="text" width={180} />
                                    ) : activeConnection ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CheckCircleIcon sx={{ fontSize: 16, color: '#22C55E' }} />
                                            <Typography variant="body2" fontWeight={500} sx={{ color: '#22C55E' }}>
                                                Connected
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', ml: 0.5 }}>
                                                — {activeConnection.googleEmail}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CancelIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                                            <Typography variant="body2" fontWeight={500} sx={{ color: '#94A3B8' }}>
                                                Not Connected
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                            {/* Show copyable Drive connect link when NOT connected */}
                            {!driveLoading && !activeConnection && effectiveUserId && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mt: 2,
                                        p: 1,
                                        pl: 2,
                                        borderRadius: 2,
                                        background: (theme) => alpha(theme.palette.primary.main, 0.04),
                                        border: '1px solid',
                                        borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                                    }}
                                >
                                    <LinkIcon sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: '12px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            flex: 1,
                                            userSelect: 'all',
                                        }}
                                    >
                                        {`${window.location.origin}/drive/connect/${effectiveUserId}/${project.id}`}
                                    </Typography>
                                    <Tooltip title={driveConnectLinkCopied ? 'Copied!' : 'Copy Drive connect link'}>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    `${window.location.origin}/drive/connect/${effectiveUserId}/${project.id}`
                                                );
                                                setDriveConnectLinkCopied(true);
                                                showToast('Drive connect link copied!', 'success');
                                                setTimeout(() => setDriveConnectLinkCopied(false), 2500);
                                            }}
                                        >
                                            <CopyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                        </>
                    )}
                </Paper>

                {/* Quick Actions */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}
                    >
                        Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap' }}>


                        <Button
                            variant="outlined"
                            startIcon={<ShareIcon />}
                            onClick={() => setIsShareModalOpen(true)}
                            sx={{
                                flex: { xs: 1, sm: 'initial' },
                                borderRadius: 2,
                                borderColor: (theme) => alpha(theme.palette.secondary.main, 0.4),
                                color: 'secondary.main',
                                '&:hover': {
                                    borderColor: 'secondary.main',
                                    backgroundColor: (theme) =>
                                        alpha(theme.palette.secondary.main, 0.08),
                                },
                            }}
                        >
                            Manage Share Links
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ArticleIcon />}
                            onClick={() => navigate(`/private/portfolio/builder/${projectId}`)}
                            sx={{
                                flex: { xs: 1, sm: 'initial' },
                                borderRadius: 2,
                                borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                                color: 'primary.main',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: (theme) =>
                                        alpha(theme.palette.primary.main, 0.08),
                                },
                            }}
                        >
                            Manage Portfolio
                        </Button>
                    </Box>
                </Paper>
                
                {/* Drive Integration (for Google Photos source) */}
                {project.source === 'google_photos' && (
                    <Box sx={{ mt: 2 }}>
                        <DriveFileBrowser 
                            studioUserId={effectiveUserId!} 
                            projectId={project.id} 
                        />
                    </Box>
                )}
            </Box>

            {/* ── Modals ── */}
            <CreateProjectModal
                open={isEditModalOpen}
                onClose={handleCloseEditModal}
                project={project}
            />

            <ManageShareLinksModal
                open={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                project={project}
            />
        </Container>
    );
};

export default ProjectDetailView;
