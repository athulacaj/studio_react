import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import { storage } from '../../../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const GalleryStep = ({ data, onUpdate }) => {
    const [images, setImages] = useState(data || []);
    const [uploading, setUploading] = useState(false);
    const [editDialog, setEditDialog] = useState({ open: false, image: null, index: null });
    const [error, setError] = useState(null);

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        setUploading(true);
        setError(null);

        try {
            const uploadPromises = files.map(async (file) => {
                const timestamp = Date.now();
                const fileName = `portfolios/${timestamp}_${file.name}`;
                const storageRef = ref(storage, fileName);

                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);

                return {
                    url,
                    fileName,
                    title: '',
                    description: '',
                    category: '',
                    uploadedAt: new Date().toISOString()
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);
            const newImages = [...images, ...uploadedImages];
            setImages(newImages);
            onUpdate(newImages);
        } catch (err) {
            setError(err.message);
            console.error('Error uploading images:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (index) => {
        try {
            const image = images[index];
            if (image.fileName) {
                const storageRef = ref(storage, image.fileName);
                await deleteObject(storageRef);
            }

            const newImages = images.filter((_, i) => i !== index);
            setImages(newImages);
            onUpdate(newImages);
        } catch (err) {
            setError(err.message);
            console.error('Error deleting image:', err);
        }
    };

    const handleEdit = (image, index) => {
        setEditDialog({ open: true, image: { ...image }, index });
    };

    const handleSaveEdit = () => {
        const newImages = [...images];
        newImages[editDialog.index] = editDialog.image;
        setImages(newImages);
        onUpdate(newImages);
        setEditDialog({ open: false, image: null, index: null });
    };

    const handleEditChange = (field, value) => {
        setEditDialog({
            ...editDialog,
            image: { ...editDialog.image, [field]: value }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Build Your Gallery
                </Typography>
                <Button
                    variant="contained"
                    component="label"
                    startIcon={<Upload size={20} />}
                    disabled={uploading}
                    sx={{
                        background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                    }}
                >
                    {uploading ? 'Uploading...' : 'Upload Images'}
                    <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {images.length === 0 ? (
                <Card
                    sx={{
                        p: 8,
                        textAlign: 'center',
                        background: 'rgba(99, 102, 241, 0.05)',
                        border: '2px dashed',
                        borderColor: 'primary.main'
                    }}
                >
                    <ImageIcon size={64} style={{ margin: '0 auto', opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        No images yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Upload your best work to showcase in your portfolio
                    </Typography>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<Upload size={20} />}
                    >
                        Upload Your First Image
                        <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                    </Button>
                </Card>
            ) : (
                <Grid container spacing={2}>
                    <AnimatePresence>
                        {images.map((image, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card
                                        sx={{
                                            position: 'relative',
                                            '&:hover .actions': {
                                                opacity: 1
                                            }
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={image.url}
                                            alt={image.title || 'Portfolio image'}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <Box
                                            className="actions"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                display: 'flex',
                                                gap: 1,
                                                opacity: 0,
                                                transition: 'opacity 0.3s'
                                            }}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(image, index)}
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    '&:hover': { bgcolor: 'primary.main' }
                                                }}
                                            >
                                                <Edit size={16} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(index)}
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    '&:hover': { bgcolor: 'error.main' }
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </Box>
                                        {image.title && (
                                            <CardContent>
                                                <Typography variant="subtitle2" noWrap>
                                                    {image.title}
                                                </Typography>
                                                {image.category && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {image.category}
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        )}
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </AnimatePresence>
                </Grid>
            )}

            {/* Edit Dialog */}
            <Dialog
                open={editDialog.open}
                onClose={() => setEditDialog({ open: false, image: null, index: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Image Details</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={editDialog.image?.title || ''}
                            onChange={(e) => handleEditChange('title', e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Category"
                            value={editDialog.image?.category || ''}
                            onChange={(e) => handleEditChange('category', e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={editDialog.image?.description || ''}
                            onChange={(e) => handleEditChange('description', e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog({ open: false, image: null, index: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </motion.div>
    );
};

export default GalleryStep;
