import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Chip,
    Box,
    alpha,
    Button,
    CircularProgress,
    Skeleton,
} from '@mui/material';
import { useStudioManagementStore } from '../store/studioManagementStore';
import {
    Google as GoogleIcon,
    Cloud as CloudIcon,
    ArrowForward as ArrowForwardIcon,
    Folder as FolderIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
    CameraAlt as CameraAltIcon,
} from '@mui/icons-material';
import { Project } from '../types';

interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const navigate = useNavigate();
    const viewAsUserId = useStudioManagementStore((state) => state.viewAsUserId);

    const formattedDate = project.createdAt?.toDate
        ? project.createdAt.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : 'Just now';

    const folderCount = project.selectedFolders?.length || 0;

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '24px',
                background: 'rgba(15, 26, 46, 0.55)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                '&:hover': {
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: '0 16px 48px rgba(157, 78, 221, 0.2), 0 8px 24px rgba(0,0,0,0.3)',
                    borderColor: 'rgba(157, 78, 221, 0.35)',
                    background: 'rgba(15, 26, 46, 0.72)',
                    '& .arrow-icon': {
                        opacity: 1,
                        transform: 'translateX(0)',
                    },
                    '& .project-name': {
                        color: '#C084FC',
                    },
                    '& .gradient-accent': {
                        opacity: 1,
                    },
                },
            }}
        >
            {/* Gradient accent line at top */}
            <Box
                className="gradient-accent"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                }}
            />

            <CardActionArea
                onClick={() => navigate(
                    viewAsUserId
                        ? `/private/admin/user/${viewAsUserId}/studio/${project.id}`
                        : `/private/studio/${project.id}`
                )}
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    p: 0,
                }}
            >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Header: Name + Source Icon */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                        <Typography
                            className="project-name"
                            variant="h6"
                            component="div"
                            noWrap
                            sx={{
                                maxWidth: '80%',
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                transition: 'color 0.25s ease',
                                color: '#F8FAFC',
                            }}
                        >
                            {project.name}
                        </Typography>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: project.source === 'google_photos'
                                    ? 'rgba(157, 78, 221, 0.12)'
                                    : 'rgba(56, 189, 248, 0.12)',
                                flexShrink: 0,
                            }}
                        >
                            {project.source === 'google_photos' ? (
                                <GoogleIcon sx={{ fontSize: 18, color: '#C084FC' }} />
                            ) : (
                                <CloudIcon sx={{ fontSize: 18, color: '#38BDF8' }} />
                            )}
                        </Box>
                    </Box>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 0.75, mb: 2.5, flexWrap: 'wrap' }}>
                        <Chip
                            label={
                                project.source === 'google_photos'
                                    ? 'Google Photos'
                                    : 'Google Drive'
                            }
                            size="small"
                            sx={{
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                height: 26,
                                backgroundColor: 'rgba(157, 78, 221, 0.12)',
                                color: '#C084FC',
                                fontWeight: 600,
                                border: '1px solid rgba(157, 78, 221, 0.2)',
                            }}
                        />
                        <Chip
                            label={project.status}
                            size="small"
                            sx={{
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                height: 26,
                                backgroundColor: project.status === 'active'
                                    ? 'rgba(34, 197, 94, 0.12)'
                                    : 'rgba(148, 163, 184, 0.12)',
                                color: project.status === 'active'
                                    ? '#22C55E'
                                    : '#94A3B8',
                                fontWeight: 600,
                                border: '1px solid',
                                borderColor: project.status === 'active'
                                    ? 'rgba(34, 197, 94, 0.2)'
                                    : 'rgba(148, 163, 184, 0.15)',
                            }}
                        />
                        {folderCount > 0 && (
                            <Chip
                                icon={<FolderIcon sx={{ fontSize: '14px !important', color: 'inherit' }} />}
                                label={`${folderCount} folder${folderCount !== 1 ? 's' : ''}`}
                                size="small"
                                sx={{
                                    borderRadius: '999px',
                                    fontSize: '0.7rem',
                                    height: 26,
                                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                                    color: '#38BDF8',
                                    fontWeight: 600,
                                    border: '1px solid rgba(56, 189, 248, 0.2)',
                                    '& .MuiChip-icon': {
                                        color: 'inherit'
                                    }
                                }}
                            />
                        )}
                    </Box>

                    {/* Footer: Date + Arrow */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 'auto',
                            pt: 2,
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                        }}
                    >
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem' }}>
                            {formattedDate}
                        </Typography>
                        <ArrowForwardIcon
                            className="arrow-icon"
                            sx={{
                                fontSize: 18,
                                color: '#9D4EDD',
                                opacity: 0,
                                transform: 'translateX(-8px)',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

const ProjectCardSkeleton: React.FC = () => (
    <Card
        sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '24px',
            background: 'rgba(15, 26, 46, 0.4)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
        }}
    >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                <Skeleton variant="text" width="65%" height={32} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.06)' }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 0.75, mb: 2.5 }}>
                <Skeleton variant="rounded" width={90} height={26} sx={{ borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.06)' }} />
                <Skeleton variant="rounded" width={60} height={26} sx={{ borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.06)' }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Skeleton variant="text" width={80} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
            </Box>
        </CardContent>
    </Card>
);

const ProjectList: React.FC = () => {
    const projects = useStudioManagementStore((state) => state.projects);
    const loading = useStudioManagementStore((state) => state.loading);
    const currentPage = useStudioManagementStore((state) => state.currentPage);
    const hasNextPage = useStudioManagementStore((state) => state.hasNextPage);
    const hasPreviousPage = useStudioManagementStore((state) => state.hasPreviousPage);
    const fetchNextPage = useStudioManagementStore((state) => state.fetchNextPage);
    const fetchPreviousPage = useStudioManagementStore((state) => state.fetchPreviousPage);

    if (loading && projects.length === 0) {
        return (
            <Grid container spacing={3}>
                {[...Array(4)].map((_, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                        <ProjectCardSkeleton />
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (!projects || projects.length === 0) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    py: 8,
                    borderRadius: '24px',
                    background: 'rgba(15, 26, 46, 0.35)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(157, 78, 221, 0.1)',
                        mx: 'auto',
                        mb: 3,
                    }}
                >
                    <CameraAltIcon sx={{ fontSize: 36, color: '#9D4EDD', opacity: 0.6 }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1 }}>
                    No projects yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 320, mx: 'auto' }}>
                    Create your first project to start managing your wedding photography.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Project Grid */}
            <Box sx={{ position: 'relative', minHeight: 200 }}>
                {loading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(3, 9, 18, 0.7)',
                            zIndex: 2,
                            borderRadius: '24px',
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <CircularProgress size={36} sx={{ color: '#9D4EDD' }} />
                    </Box>
                )}
                <Grid container spacing={3}>
                    {projects.map((project) => (
                        <Grid item xs={12} sm={6} md={4} key={project.id}>
                            <ProjectCard project={project} />
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Pagination Controls */}
            {(hasPreviousPage || hasNextPage) && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                        mt: 5,
                        pt: 4,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<NavigateBeforeIcon />}
                        onClick={fetchPreviousPage}
                        disabled={!hasPreviousPage || loading}
                        sx={{
                            borderRadius: '16px',
                            textTransform: 'none',
                            px: 2.5,
                            borderColor: 'rgba(157, 78, 221, 0.25)',
                            color: '#C084FC',
                            background: 'rgba(157, 78, 221, 0.04)',
                            '&:hover': {
                                borderColor: '#9D4EDD',
                                backgroundColor: 'rgba(157, 78, 221, 0.1)',
                                boxShadow: '0 0 20px rgba(157, 78, 221, 0.15)',
                            },
                            '&.Mui-disabled': {
                                borderColor: 'rgba(255,255,255,0.05)',
                                color: '#64748B',
                            },
                            transition: 'all 0.25s ease',
                        }}
                    >
                        Previous
                    </Button>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 44,
                            height: 40,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            boxShadow: '0 0 24px rgba(157, 78, 221, 0.3)',
                        }}
                    >
                        {currentPage}
                    </Box>

                    <Button
                        variant="outlined"
                        size="small"
                        endIcon={<NavigateNextIcon />}
                        onClick={fetchNextPage}
                        disabled={!hasNextPage || loading}
                        sx={{
                            borderRadius: '16px',
                            textTransform: 'none',
                            px: 2.5,
                            borderColor: 'rgba(157, 78, 221, 0.25)',
                            color: '#C084FC',
                            background: 'rgba(157, 78, 221, 0.04)',
                            '&:hover': {
                                borderColor: '#9D4EDD',
                                backgroundColor: 'rgba(157, 78, 221, 0.1)',
                                boxShadow: '0 0 20px rgba(157, 78, 221, 0.15)',
                            },
                            '&.Mui-disabled': {
                                borderColor: 'rgba(255,255,255,0.05)',
                                color: '#64748B',
                            },
                            transition: 'all 0.25s ease',
                        }}
                    >
                        Next
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default ProjectList;
