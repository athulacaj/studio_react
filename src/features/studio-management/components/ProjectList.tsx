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
                borderRadius: 4,
                background: (theme) => `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.4)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                backdropFilter: 'blur(8px)',
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.common.white, 0.08),
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) =>
                        `0 16px 32px ${alpha(theme.palette.primary.main, 0.15)}, 0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`,
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                    background: (theme) => `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.6)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                    '& .arrow-icon': {
                        opacity: 1,
                        transform: 'translateX(0)',
                    },
                    '& .project-name': {
                        color: 'primary.light',
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
                    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
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
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    {/* Header: Name + Source Icon */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography
                            className="project-name"
                            variant="h6"
                            component="div"
                            noWrap
                            sx={{
                                maxWidth: '80%',
                                fontWeight: 600,
                                transition: 'color 0.2s ease',
                            }}
                        >
                            {project.name}
                        </Typography>
                        {project.source === 'google_photos' ? (
                            <GoogleIcon color="primary" sx={{ fontSize: 22, opacity: 0.7 }} />
                        ) : (
                            <CloudIcon color="secondary" sx={{ fontSize: 22, opacity: 0.7 }} />
                        )}
                    </Box>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                            label={
                                project.source === 'google_photos'
                                    ? 'Google Photos'
                                    : 'Google Drive'
                            }
                            size="small"
                            sx={{ 
                                borderRadius: 1.5, 
                                fontSize: '0.7rem', 
                                height: 24,
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                                color: (theme) => theme.palette.primary.light,
                                fontWeight: 600,
                                border: '1px solid',
                                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                            }}
                        />
                        <Chip
                            label={project.status}
                            size="small"
                            sx={{ 
                                borderRadius: 1.5, 
                                fontSize: '0.7rem', 
                                height: 24,
                                backgroundColor: (theme) => project.status === 'active' 
                                    ? alpha(theme.palette.success.main, 0.15) 
                                    : alpha(theme.palette.text.secondary, 0.15),
                                color: (theme) => project.status === 'active' 
                                    ? theme.palette.success.light 
                                    : theme.palette.text.secondary,
                                fontWeight: 600,
                                border: '1px solid',
                                borderColor: (theme) => project.status === 'active' 
                                    ? alpha(theme.palette.success.main, 0.2) 
                                    : alpha(theme.palette.text.secondary, 0.2),
                            }}
                        />
                        {folderCount > 0 && (
                            <Chip
                                icon={<FolderIcon sx={{ fontSize: '14px !important', color: 'inherit' }} />}
                                label={`${folderCount} folder${folderCount !== 1 ? 's' : ''}`}
                                size="small"
                                sx={{
                                    borderRadius: 1.5,
                                    fontSize: '0.7rem',
                                    height: 24,
                                    backgroundColor: (theme) => alpha(theme.palette.info.main, 0.15),
                                    color: (theme) => theme.palette.info.light,
                                    fontWeight: 600,
                                    border: '1px solid',
                                    borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
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
                            pt: 1.5,
                            borderTop: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            {formattedDate}
                        </Typography>
                        <ArrowForwardIcon
                            className="arrow-icon"
                            sx={{
                                fontSize: 18,
                                color: 'primary.main',
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
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.divider, 0.08),
        }}
    >
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Skeleton variant="text" width="65%" height={32} />
                <Skeleton variant="circular" width={22} height={22} />
            </Box>
            <Box sx={{ display: 'flex', gap: 0.75, mb: 2 }}>
                <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 2 }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.08) }}>
                <Skeleton variant="text" width={80} height={20} />
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
                    py: 6,
                    color: 'text.secondary',
                }}
            >
                <FolderIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                <Typography variant="h6">No projects found</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Create a new project to get started
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
                            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.7),
                            zIndex: 2,
                            borderRadius: 2,
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <CircularProgress size={36} sx={{ color: '#6366f1' }} />
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
                        mt: 4,
                        pt: 3,
                        borderTop: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                    }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<NavigateBeforeIcon />}
                        onClick={fetchPreviousPage}
                        disabled={!hasPreviousPage || loading}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 2.5,
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                            '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                            },
                            '&.Mui-disabled': {
                                borderColor: (theme) => alpha(theme.palette.divider, 0.15),
                            },
                        }}
                    >
                        Previous
                    </Button>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 40,
                            height: 36,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
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
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 2.5,
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                            '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                            },
                            '&.Mui-disabled': {
                                borderColor: (theme) => alpha(theme.palette.divider, 0.15),
                            },
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
