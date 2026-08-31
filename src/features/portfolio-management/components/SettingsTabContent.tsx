import React from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Avatar,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    InsertDriveFile as FileIcon,
    SwapHoriz as ChangeTemplateIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { usePortfolioContext } from '../context/portfolioGlobalContext';




export const SettingsTabContent: React.FC = () => {
    const { managePortfolioController } = usePortfolioContext();

    const {
        isPublishing,
        versions,
        selectedVersionPath,
        handlePublish,
        handleVersionChange,
        handleDownloadHtml,
        setStep,
        VERSION_LIMIT
    } = managePortfolioController;
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2.5, sm: 4 } }}>
            {/* Publish Card */}
            <Paper sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: 3.5,
                bgcolor: 'rgba(124, 58, 237, 0.05)',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    bgcolor: 'rgba(124, 58, 237, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    pointerEvents: 'none'
                }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(124, 58, 237, 0.2)', color: '#C084FC', mr: 2 }}>
                        <UploadIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
                        Publish Portfolio
                    </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, lineHeight: 1.6, maxWidth: '95%', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                    Make your portfolio live and accessible to the world. Publishing will securely save your current configuration, images, and layout, generating a new snapshot in your version history.
                </Typography>

                <Button
                    variant="contained"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    startIcon={isPublishing ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                    sx={{
                        width: { xs: '100%', sm: 'auto' },
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: '0 8px 16px rgba(124, 58, 237, 0.25)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 20px rgba(124, 58, 237, 0.4)',
                        },
                        '&.Mui-disabled': {
                            background: 'rgba(255,255,255,0.05)',
                            color: '#64748B',
                            boxShadow: 'none'
                        }
                    }}
                >
                    {isPublishing ? 'Publishing...' : 'Publish Now'}
                </Button>
            </Paper>

            {/* Change Template Card */}
            <Paper sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: 3.5,
                bgcolor: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    pointerEvents: 'none'
                }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', mr: 2 }}>
                        <ChangeTemplateIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
                        Change Template
                    </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, lineHeight: 1.6, maxWidth: '95%', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                    Switch to a different template. Note that changing your template will require you to reconfigure some settings and content to fit the new layout.
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => setStep(1)}
                    startIcon={<ChangeTemplateIcon />}
                    sx={{
                        width: { xs: '100%', sm: 'auto' },
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 20px rgba(59, 130, 246, 0.4)',
                        }
                    }}
                >
                    Change Template
                </Button>
            </Paper>

            {/* Version History Card */}
            {versions.length > 0 && (
                <Paper sx={{
                    p: { xs: 2.5, sm: 4 },
                    borderRadius: 3.5,
                    bgcolor: 'rgba(15, 26, 46, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#94A3B8', mr: 2 }}>
                            <FileIcon />
                        </Avatar>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
                            Version History
                        </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, lineHeight: 1.6, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                        Easily roll back to any of your {VERSION_LIMIT} most recent portfolio versions. Selecting a past version will instantly load its layout and configuration into the editor.
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
                        <FormControl fullWidth variant="outlined" sx={{
                            '& .MuiOutlinedInput-root': {
                                color: '#fff',
                                bgcolor: 'rgba(0,0,0,0.2)',
                                borderRadius: '12px',
                                transition: 'all 0.2s ease',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                '&.Mui-focused fieldset': { borderColor: '#C084FC', borderWidth: '1px' }
                            },
                            '& .MuiInputLabel-root': { color: '#64748B' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#C084FC' },
                            '& .MuiSvgIcon-root': { color: '#94A3B8' }
                        }}>
                            <InputLabel id="version-select-label">Load Version</InputLabel>
                            <Select
                                labelId="version-select-label"
                                value={selectedVersionPath}
                                onChange={handleVersionChange}
                                label="Load Version"
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: '#0f172a',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            '& .MuiMenuItem-root': {
                                                color: '#e2e8f0',
                                                '&:hover': { bgcolor: 'rgba(192,132,252,0.1)' },
                                                '&.Mui-selected': { bgcolor: 'rgba(192,132,252,0.2)', color: '#C084FC' },
                                                '&.Mui-selected:hover': { bgcolor: 'rgba(192,132,252,0.3)' }
                                            }
                                        }
                                    }
                                }}
                            >
                                {versions.map((v, index) => {
                                    const d = new Date(v.publishedAt);
                                    const day = String(d.getDate()).padStart(2, '0');
                                    const month = String(d.getMonth() + 1).padStart(2, '0');
                                    const year = String(d.getFullYear()).slice(-2);

                                    return (
                                        <MenuItem key={v.path} value={v.path} sx={{ py: 1.5 }}>
                                            {`${index + 1} - ${day}/${month}/${year}`}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            onClick={handleDownloadHtml}
                            disabled={!selectedVersionPath}
                            startIcon={<DownloadIcon />}
                            sx={{
                                height: 56,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                                px: 3,
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 20px rgba(16, 185, 129, 0.4)',
                                },
                                '&.Mui-disabled': {
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#64748B',
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            Download HTML
                        </Button>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default SettingsTabContent;
