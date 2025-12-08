import React, { useState } from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import CreateProjectModal from '../components/CreateProjectModal';
import ManageShareLinksModal from '../components/ManageShareLinksModal';
import ProjectList from '../components/ProjectList';

const StudioDashboard = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [managingLinksProject, setManagingLinksProject] = useState(null);

    const handleEditProject = (project) => {
        setEditingProject(project);
        setIsCreateModalOpen(true);
    };

    const handleManageLinks = (project) => {
        setManagingLinksProject(project);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setEditingProject(null);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Studio Manager
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Add Project
                </Button>
            </Box>

            <Paper sx={{ p: 3, mb: 4, backgroundColor: 'background.paper' }} elevation={0}>
                <Typography variant="h6" gutterBottom>
                    Projects
                </Typography>
                <ProjectList
                    onEdit={handleEditProject}
                    onManageLinks={handleManageLinks}
                />
            </Paper>

            <CreateProjectModal
                open={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                project={editingProject}
            />

            <ManageShareLinksModal
                open={!!managingLinksProject}
                onClose={() => setManagingLinksProject(null)}
                project={managingLinksProject}
            />
        </Container>
    );
};

export default StudioDashboard;
