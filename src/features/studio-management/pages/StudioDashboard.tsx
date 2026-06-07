import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, alpha } from '@mui/material';
import { Add as AddIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectList from '../components/ProjectList';
import { useUserStore } from '../../auth';
import { useStudioManagementStore } from '../store/studioManagementStore';

const StudioDashboard: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();
    const { userProfile } = useUserStore();
    const viewAsUserId = useStudioManagementStore((state) => state.viewAsUserId);

    // When admin is viewing another user's dashboard, hide management actions
    const isAdminViewing = !!viewAsUserId && userProfile?.isAdmin;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    {isAdminViewing ? 'User Dashboard' : 'Studio Manager'}
                </Typography>
                {!isAdminViewing && (
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        {userProfile?.isAdmin && (
                            <Button
                                variant="outlined"
                                startIcon={<AdminIcon />}
                                onClick={() => navigate('/private/admin')}
                                sx={{
                                    borderRadius: 2,
                                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                                    color: '#a78bfa',
                                    fontWeight: 600,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                                        opacity: 1,
                                    },
                                    '&:hover': {
                                        borderColor: '#a78bfa',
                                        boxShadow: '0 4px 14px rgba(168, 85, 247, 0.2)',
                                        '&::before': {
                                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                                        },
                                    },
                                }}
                            >
                                Admin Panel
                            </Button>
                        )}
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
                )}
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

            {!isAdminViewing && (
                <CreateProjectModal
                    open={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </Container>
    );
};

export default StudioDashboard;
