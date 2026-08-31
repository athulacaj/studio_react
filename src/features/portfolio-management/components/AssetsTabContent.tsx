import React from 'react';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Image as ImageIcon,
    InsertDriveFile as FileIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import UploadDialogComponent from '../../../shared/components/UploadDialogComponent';
import { usePortfolioContext } from '../context/portfolioGlobalContext';

export const AssetsTabContent: React.FC = () => {
    const { managePortfolioController } = usePortfolioContext();

    const {
        isUploadDialogOpen,
        setIsUploadDialogOpen,
        isProcessingFiles,
        isUploading,
        uploadProgress,
        uploadedImages,
        processFiles,
        handleRemoveAsset } = managePortfolioController;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Assets ({uploadedImages.length})
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => setIsUploadDialogOpen(true)}
                    sx={{
                        color: '#C084FC',
                        borderColor: 'rgba(192, 132, 252, 0.4)',
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2,
                        py: 0.75,
                        '&:hover': { borderColor: '#C084FC', bgcolor: 'rgba(192, 132, 252, 0.1)' }
                    }}
                >
                    Upload
                </Button>
            </Box>

            {isProcessingFiles && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'rgba(192, 132, 252, 0.08)', borderRadius: 1.5, border: '1px solid rgba(192, 132, 252, 0.2)', color: '#C084FC' }}>
                    <CircularProgress size={18} sx={{ mr: 1.5, color: 'inherit' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Processing files...</Typography>
                </Box>
            )}

            {isUploading && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(15, 26, 46, 0.6)', borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>Uploading to cloud...</Typography>
                        <Typography variant="body2" sx={{ color: '#C084FC', fontWeight: 'bold' }}>{uploadProgress}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        sx={{
                            height: 6,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': { bgcolor: '#C084FC' }
                        }}
                    />
                </Box>
            )}

            {uploadedImages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 }, px: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <ImageIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: 'rgba(255,255,255,0.15)', mb: 1.5 }} />
                    <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 500 }}>No assets uploaded yet.</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                        Upload logos, banners, or portfolio images to use in your template.
                    </Typography>
                </Box>
            ) : (
                <List sx={{ width: '100%', p: 0 }}>
                    {uploadedImages.map((img) => (
                        <ListItem
                            key={img.id}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.03)',
                                borderRadius: 1.5,
                                mb: 1.5,
                                border: '1px solid rgba(255,255,255,0.06)',
                                p: 1.5,
                                pr: 6,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    borderColor: 'rgba(192, 132, 252, 0.2)'
                                }
                            }}
                        >
                            <ListItemAvatar sx={{ minWidth: 54 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', width: 44, height: 44, borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {img.file?.type.startsWith('image/') || img.url.endsWith('.webp') || img.url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                        <img src={img.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <FileIcon sx={{ color: '#94A3B8' }} />
                                    )}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={img.file?.name || img.fileKey || 'Uploaded Asset'}
                                secondary={`${img.file && img.file.size > 0 ? (img.file.size / 1024).toFixed(1) + ' KB ' : ''}${img.compressed ? '• (Compressed)' : ''}`}
                                primaryTypographyProps={{
                                    color: '#fff',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    noWrap: true
                                }}
                                secondaryTypographyProps={{ color: '#94A3B8', fontSize: '0.75rem' }}
                            />
                            <ListItemSecondaryAction sx={{ right: 8 }}>
                                <IconButton
                                    edge="end"
                                    onClick={() => handleRemoveAsset(img.id)}
                                    sx={{
                                        color: '#EF4444',
                                        bgcolor: 'rgba(239, 68, 68, 0.08)',
                                        p: 1,
                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                    }}
                                    title="Delete Asset"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}

            <UploadDialogComponent
                open={isUploadDialogOpen}
                onClose={() => setIsUploadDialogOpen(false)}
                onUpload={processFiles}
                multiple={true}
                accept="image/*"
            />
        </Box>
    );
};

export default AssetsTabContent;
