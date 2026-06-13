import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Chip } from '@mui/material';
import {
    Add as AddIcon,
    AdminPanelSettings as AdminIcon,
    CameraAlt as CameraIcon,
    PhotoLibrary as GalleryIcon,
    FolderSpecial as FolderIcon,
    AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectList from '../components/ProjectList';
import { useUserStore } from '../../auth';
import { useStudioManagementStore } from '../store/studioManagementStore';

const StudioDashboard: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();
    const { userProfile } = useUserStore();
    const viewAsUserId = useStudioManagementStore((state) => state.viewAsUserId);
    const projects = useStudioManagementStore((state) => state.projects);

    // When admin is viewing another user's dashboard, hide management actions
    const isAdminViewing = !!viewAsUserId && userProfile?.isAdmin;

    const totalFolders = projects.reduce((acc, p) => acc + (p.selectedFolders?.length || 0), 0);
    const activeProjects = projects.filter(p => p.status === 'active').length;

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #030912 0%, #040D18 50%, #050E1A 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Ambient glow orbs */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(157, 78, 221, 0.12) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '-10%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    pointerEvents: 'none',
                }}
            />

            <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 }, position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                <Box
                    sx={{
                        mb: { xs: 4, md: 6 },
                        animation: 'fadeInUp 0.6s ease-out',
                        '@keyframes fadeInUp': {
                            from: { opacity: 0, transform: 'translateY(20px)' },
                            to: { opacity: 1, transform: 'translateY(0)' },
                        },
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', md: 'center' },
                            gap: { xs: 3, md: 0 },
                            mb: 4,
                        }}
                    >
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Chip
                                    icon={<SparkleIcon sx={{ fontSize: '14px !important', color: '#C084FC !important' }} />}
                                    label={isAdminViewing ? 'Admin View' : 'Studio Manager'}
                                    size="small"
                                    sx={{
                                        background: 'rgba(157, 78, 221, 0.15)',
                                        border: '1px solid rgba(157, 78, 221, 0.25)',
                                        color: '#C084FC',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        borderRadius: '999px',
                                        '& .MuiChip-icon': { color: '#C084FC' },
                                    }}
                                />
                            </Box>
                            <Typography
                                variant="h3"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '28px', md: '36px' },
                                    lineHeight: 1.1,
                                    background: 'linear-gradient(135deg, #F8FAFC 0%, #CBD5E1 50%, #C084FC 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1,
                                }}
                            >
                                {isAdminViewing ? 'User Dashboard' : `Welcome back${userProfile?.name ? `, ${userProfile.name}` : ''}`}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#94A3B8',
                                    fontSize: { xs: '14px', md: '16px' },
                                    maxWidth: 500,
                                }}
                            >
                                Manage your wedding & event photography projects with elegance.
                            </Typography>
                        </Box>

                        {!isAdminViewing && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1.5,
                                    alignItems: 'center',
                                    width: { xs: '100%', sm: 'auto' },
                                    flexWrap: 'wrap',
                                }}
                            >
                                {userProfile?.isAdmin && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<AdminIcon />}
                                        onClick={() => navigate('/private/admin')}
                                        sx={{
                                            flex: { xs: 1, sm: 'initial' },
                                            borderRadius: '16px',
                                            borderColor: 'rgba(157, 78, 221, 0.3)',
                                            color: '#C084FC',
                                            fontWeight: 600,
                                            background: 'rgba(157, 78, 221, 0.06)',
                                            backdropFilter: 'blur(8px)',
                                            '&:hover': {
                                                borderColor: '#9D4EDD',
                                                background: 'rgba(157, 78, 221, 0.12)',
                                                boxShadow: '0 0 24px rgba(157, 78, 221, 0.2)',
                                                transform: 'translateY(-2px)',
                                            },
                                            transition: 'all 0.25s ease',
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
                                        flex: { xs: 1, sm: 'initial' },
                                        borderRadius: '16px',
                                        background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                                        boxShadow: '0 0 30px rgba(157, 78, 221, 0.3)',
                                        fontWeight: 600,
                                        px: 3,
                                        '&:hover': {
                                            background: 'linear-gradient(90deg, #6D28D9 0%, #9D4EDD 100%)',
                                            boxShadow: '0 0 50px rgba(157, 78, 221, 0.45)',
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.25s ease',
                                    }}
                                >
                                    New Project
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Quick Stats */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                            gap: 2,
                            animation: 'fadeInUp 0.6s ease-out 0.15s both',
                        }}
                    >
                        {[
                            {
                                icon: <CameraIcon sx={{ fontSize: 28, color: '#9D4EDD' }} />,
                                label: 'Total Projects',
                                value: projects.length,
                                glowColor: 'rgba(157, 78, 221, 0.15)',
                            },
                            {
                                icon: <GalleryIcon sx={{ fontSize: 28, color: '#22C55E' }} />,
                                label: 'Active',
                                value: activeProjects,
                                glowColor: 'rgba(34, 197, 94, 0.12)',
                            }
                        ].map((stat) => (
                            <Box
                                key={stat.label}
                                sx={{
                                    p: { xs: 2, md: 3 },
                                    borderRadius: '24px',
                                    background: 'rgba(15, 26, 46, 0.5)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        background: 'rgba(15, 26, 46, 0.72)',
                                        boxShadow: `0 0 30px ${stat.glowColor}`,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: stat.glowColor,
                                        flexShrink: 0,
                                    }}
                                >
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: { xs: '22px', md: '28px' },
                                            lineHeight: 1,
                                            color: '#F8FAFC',
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#64748B',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.02em',
                                        }}
                                    >
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Projects Section */}
                <Box
                    sx={{
                        animation: 'fadeInUp 0.6s ease-out 0.3s both',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            mb: 3,
                        }}
                    >
                        <Box
                            sx={{
                                width: 4,
                                height: 28,
                                borderRadius: '999px',
                                background: 'linear-gradient(180deg, #9D4EDD 0%, #A855F7 100%)',
                            }}
                        />
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                fontSize: { xs: '20px', md: '24px' },
                                color: '#F8FAFC',
                            }}
                        >
                            Your Projects
                        </Typography>
                    </Box>

                    <ProjectList />
                </Box>

                {!isAdminViewing && (
                    <CreateProjectModal
                        open={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                    />
                )}
            </Container>
        </Box>
    );
};

export default StudioDashboard;
