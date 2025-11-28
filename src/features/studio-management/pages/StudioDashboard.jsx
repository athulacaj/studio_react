import React, { useState } from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectList from '../components/ProjectList';

const StudioDashboard = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
                <ProjectList />
            </Paper>

            <CreateProjectModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </Container>
    );
};

export default StudioDashboard;
