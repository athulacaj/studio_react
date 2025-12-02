import React, { useState } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
    IconButton,
    Tooltip,
    Snackbar,
    Alert
} from '@mui/material';
import { useStudioManagement } from '../context/StudioManagementContext';
import { useAuth } from '../../auth';
import { Google as GoogleIcon, Cloud as CloudIcon, ContentCopy as CopyIcon } from '@mui/icons-material';

const ProjectList = () => {
    const { projects } = useStudioManagement();
    const { currentUser } = useAuth();
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleCopyLink = (projectId) => {
        if (!currentUser) return;
        const link = `${window.location.origin}/view/${currentUser.uid}/${projectId}`;
        navigator.clipboard.writeText(link);
        setSnackbarOpen(true);
    };

    if (!projects || projects.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography variant="h6">No projects found</Typography>
                <Typography variant="body2">Create a new project to get started</Typography>
            </Box>
        );
    }

    return (
        <>
            <Grid container spacing={3}>
                {projects.map((project) => (
                    <Grid item xs={12} sm={6} md={4} key={project.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '70%' }}>
                                        {project.name}
                                    </Typography>
                                    <Box>
                                        <Tooltip title="Copy Project Link">
                                            <IconButton size="small" onClick={() => handleCopyLink(project.id)}>
                                                <CopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
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
                    </Grid>
                ))}
            </Grid>
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

export default ProjectList;
