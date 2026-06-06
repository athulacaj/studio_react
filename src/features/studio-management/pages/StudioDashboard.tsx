import React, { useState } from 'react';
import { Container, Typography, Box, Button, Paper, alpha } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectList from '../components/ProjectList';

const StudioDashboard: React.FC = () => {
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
                    sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                        '&:hover': {
                            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.45)',
                        },
                    }}
                >
                    Add Project
                </Button>
            </Box>

            <Paper
                sx={{
                    p: 3,
                    mb: 4,
                    backgroundColor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                }}
                elevation={0}
            >
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
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
