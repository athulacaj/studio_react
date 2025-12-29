import React, { useState } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
    IconButton,
    Snackbar,
    Alert,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { useStudioManagement } from '../context/StudioManagementContext';
import { useAuth } from '../../auth';
import {
    Google as GoogleIcon,
    Cloud as CloudIcon,
    ContentCopy as CopyIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Share as ShareIcon
} from '@mui/icons-material';
import { Project } from '../types';

interface ProjectCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onManageLinks: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onManageLinks }) => {
    const auth = useAuth();
    const currentUser = auth?.currentUser;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleCopyLink = () => {
        if (!currentUser) return;
        const link = `${window.location.origin}/view/${currentUser.uid}/${project.id}`;
        navigator.clipboard.writeText(link);
        setSnackbarOpen(true);
        handleMenuClose();
    };

    const handleEdit = () => {
        onEdit(project);
        handleMenuClose();
    };

    const handleManageLinks = () => {
        onManageLinks(project);
        handleMenuClose();
    };

    return (
        <>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '70%' }}>
                            {project.name}
                        </Typography>
                        <Box>
                            <IconButton size="small" onClick={handleMenuOpen}>
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleEdit}>
                                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText>Edit Project</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleManageLinks}>
                                    <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText>Manage Shareable Links</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleCopyLink}>
                                    <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText>Copy Project Link</ListItemText>
                                </MenuItem>
                            </Menu>
                            {project.source === 'google_photos' ? (
                                <GoogleIcon color="primary" sx={{ ml: 1 }} />
                            ) : (
                                <CloudIcon color="secondary" sx={{ ml: 1 }} />
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                            label={project.source === 'google_photos' ? 'Google Photos' : 'Google Drive'}
                            size="small"
                            variant="outlined"
                        />
                        <Chip
                            label={project.status}
                            size="small"
                            color={project.status === 'active' ? 'success' : 'default'}
                        />
                    </Box>
                    {project.driveUrl && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                            URL: {project.driveUrl}
                        </Typography>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                        Created: {project.createdAt?.toDate ? project.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </Typography>
                </CardContent>
            </Card>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    Project link copied to clipboard!
                </Alert>
            </Snackbar>
        </>
    );
};

interface ProjectListProps {
    onEdit: (project: Project) => void;
    onManageLinks: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onEdit, onManageLinks }) => {
    const { projects } = useStudioManagement();

    if (!projects || projects.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography variant="h6">No projects found</Typography>
                <Typography variant="body2">Create a new project to get started</Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {projects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <ProjectCard
                        project={project}
                        onEdit={onEdit}
                        onManageLinks={onManageLinks}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default ProjectList;
