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
                <Typography variant="h6" sx={{ color: '#fff' }}>Assets ({uploadedImages.length})</Typography>
                <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => setIsUploadDialogOpen(true)}
                    sx={{
                        color: '#C084FC',
                        borderColor: '#C084FC',
                        '&:hover': { borderColor: '#A855F7', bgcolor: 'rgba(192, 132, 252, 0.1)' }
                    }}
                >
                    Upload
                </Button>
            </Box>

            {isProcessingFiles && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: '#C084FC' }}>
                    <CircularProgress size={20} sx={{ mr: 2, color: 'inherit' }} />
                    <Typography variant="body2">Processing files...</Typography>
                </Box>
            )}

            {isUploading && (
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>Uploading to cloud...</Typography>
                        <Typography variant="body2" sx={{ color: '#C084FC', fontWeight: 'bold' }}>{uploadProgress}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': { bgcolor: '#C084FC' }
                        }}
                    />
                </Box>
            )}

            {uploadedImages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                    <ImageIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#94A3B8' }}>No assets uploaded yet.</Typography>
                </Box>
            ) : (
                <List sx={{ width: '100%', p: 0 }}>
                    {uploadedImages.map((img) => (
                        <ListItem
                            key={img.id}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.03)',
                                borderRadius: 2,
                                mb: 1.5,
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'transparent', width: 48, height: 48, mr: 2, borderRadius: 1 }}>
                                    {img.file?.type.startsWith('image/') || img.url.endsWith('.webp') ? (
                                        <img src={img.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <FileIcon sx={{ color: '#94A3B8' }} />
                                    )}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={img.file?.name || 'Uploaded Asset'}
                                secondary={`${img.file && img.file.size > 0 ? (img.file.size / 1024).toFixed(2) + ' KB ' : ''}${img.compressed ? '(Compressed)' : ''}`}
                                primaryTypographyProps={{ color: '#fff', noWrap: true }}
                                secondaryTypographyProps={{ color: '#94A3B8' }}
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => handleRemoveAsset(img.id)} sx={{ color: '#ef4444' }}>
                                    <DeleteIcon />
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
