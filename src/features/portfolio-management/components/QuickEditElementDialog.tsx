import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Collapse,
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    Check as CheckIcon,
    InsertDriveFile as FileIcon,
    Collections as GalleryIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    AutoAwesome as SparklesIcon,
} from '@mui/icons-material';
import { SelectedElementInfo, UploadedImage } from '../store/portfolioStore';

interface QuickEditElementDialogProps {
    open: boolean;
    onClose: () => void;
    selectedElement: SelectedElementInfo | null;
    onApply: (path: string[], newValue: any) => void;
    uploadedImages: UploadedImage[];
}

export const QuickEditElementDialog: React.FC<QuickEditElementDialogProps> = ({
    open,
    onClose,
    selectedElement,
    onApply,
    uploadedImages,
}) => {
    const [localValue, setLocalValue] = useState<string>('');
    const [showAssetGallery, setShowAssetGallery] = useState<boolean>(false);

    useEffect(() => {
        if (selectedElement) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalValue(String(selectedElement.value ?? ''));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowAssetGallery(false);
        }
    }, [selectedElement, open]);

    if (!selectedElement) return null;

    const isImage = selectedElement.isImage;
    const isMultiline =
        !isImage &&
        (localValue.length > 55 ||
            /description|bio|about|content|message|quote|review|text|summary/i.test(selectedElement.fieldKey));

    const handleSave = () => {
        onApply(selectedElement.path, localValue);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (!isMultiline || e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
    };

    const handleSelectAsset = (img: UploadedImage) => {
        const finalUrl = img.fileKey
            ? `${import.meta.env.VITE_R2_BASEURL}/${img.fileKey}`
            : img.url;
        setLocalValue(finalUrl);
        setShowAssetGallery(false);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#0B132B',
                    backgroundImage: 'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.2), transparent 70%)',
                    border: '1px solid rgba(192, 132, 252, 0.3)',
                    borderRadius: 2.5,
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(124, 58, 237, 0.25)',
                    overflow: 'hidden',
                    m: { xs: 1.5, sm: 3 },
                    width: { xs: 'calc(100% - 24px)', sm: '100%' },
                },
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    pb: { xs: 1.5, sm: 1.5 },
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1, pr: 1 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            flexShrink: 0,
                            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)',
                            border: '1px solid rgba(168, 85, 247, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <EditIcon sx={{ color: '#C084FC', fontSize: 18 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: '#FFF',
                                fontWeight: 700,
                                lineHeight: 1.2,
                                fontSize: { xs: '0.9375rem', sm: '1rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Edit {selectedElement.fieldKey}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Chip
                                size="small"
                                icon={<SparklesIcon sx={{ fontSize: '13px !important', color: '#C084FC !important' }} />}
                                label={selectedElement.label}
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    color: '#94A3B8',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    height: 20,
                                    maxWidth: '100%',
                                    borderRadius: 1,
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </Box>

                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: '#94A3B8',
                        borderRadius: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        flexShrink: 0,
                        '&:hover': { color: '#FFF', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Box height={3}></Box>
            {/* Content */}
            <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, pt: { xs: 2, sm: 2.5 }, bgcolor: 'rgba(3, 9, 18, 0.3)' }}>
                {isImage ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Live Image Preview Frame */}
                        {localValue && (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 160,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    bgcolor: '#030912',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                }}
                            >
                                <Box
                                    component="img"
                                    src={localValue}
                                    alt="Preview"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                    }}
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Box>
                        )}

                        <TextField
                            fullWidth
                            label="Image URL"
                            value={localValue}
                            onChange={(e) => setLocalValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            variant="outlined"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(15, 23, 42, 0.6)',
                                    borderRadius: 1.5,
                                    color: '#FFF',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                                    '&:hover fieldset': { borderColor: 'rgba(192, 132, 252, 0.4)' },
                                    '&.Mui-focused fieldset': { borderColor: '#C084FC' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#C084FC' },
                            }}
                        />

                        {/* Toggle Gallery Button */}
                        <Button
                            variant="outlined"
                            startIcon={<GalleryIcon />}
                            endIcon={showAssetGallery ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            onClick={() => setShowAssetGallery((prev) => !prev)}
                            sx={{
                                color: '#C084FC',
                                borderColor: 'rgba(192, 132, 252, 0.3)',
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                '&:hover': {
                                    borderColor: '#C084FC',
                                    bgcolor: 'rgba(192, 132, 252, 0.08)',
                                },
                            }}
                        >
                            {showAssetGallery ? 'Hide Assets Library' : `Choose From Assets (${uploadedImages.length})`}
                        </Button>

                        {/* Expandable Asset Library Picker */}
                        <Collapse in={showAssetGallery}>
                            <Box
                                sx={{
                                    bgcolor: 'rgba(15, 23, 42, 0.7)',
                                    borderRadius: 2,
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    maxHeight: 180,
                                    overflowY: 'auto',
                                    p: 1,
                                }}
                            >
                                {uploadedImages.length === 0 ? (
                                    <Typography variant="body2" sx={{ color: '#94A3B8', p: 2, textAlign: 'center' }}>
                                        No assets uploaded yet in the Assets tab.
                                    </Typography>
                                ) : (
                                    <List dense sx={{ p: 0 }}>
                                        {uploadedImages.map((img) => (
                                            <ListItem key={img.id} disablePadding sx={{ mb: 0.5 }}>
                                                <ListItemButton
                                                    onClick={() => handleSelectAsset(img)}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        '&:hover': { bgcolor: 'rgba(192, 132, 252, 0.15)' },
                                                    }}
                                                >
                                                    <ListItemAvatar sx={{ minWidth: 44 }}>
                                                        <Avatar sx={{ bgcolor: 'transparent', width: 32, height: 32, borderRadius: 1 }}>
                                                            {img.file?.type.startsWith('image/') || img.url.endsWith('.webp') || img.url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                                                <img src={img.url} alt="asset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <FileIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                                                            )}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={img.file?.name || img.fileKey || 'Asset'}
                                                        primaryTypographyProps={{ color: '#FFF', fontSize: '0.8125rem', noWrap: true }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        </Collapse>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField
                            fullWidth
                            autoFocus
                            multiline={isMultiline}
                            rows={isMultiline ? 4 : 1}
                            label={selectedElement.fieldKey}
                            value={localValue}
                            onChange={(e) => setLocalValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(15, 23, 42, 0.6)',
                                    borderRadius: 1.5,
                                    color: '#FFF',
                                    fontSize: '0.95rem',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                                    '&:hover fieldset': { borderColor: 'rgba(192, 132, 252, 0.4)' },
                                    '&.Mui-focused fieldset': { borderColor: '#C084FC', borderWidth: '1.5px' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#C084FC' },
                            }}
                        />
                        <Typography variant="caption" sx={{ color: '#64748B', px: 0.5 }}>
                            {isMultiline ? 'Tip: Press Ctrl+Enter or Cmd+Enter to apply changes.' : 'Tip: Press Enter to apply changes.'}
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            {/* Actions */}
            <DialogActions
                sx={{
                    p: { xs: 1.5, sm: 2 },
                    px: { xs: 2, sm: 2.5 },
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                }}
            >
                <Button
                    onClick={onClose}
                    sx={{
                        color: '#94A3B8',
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        px: { xs: 1.5, sm: 2 },
                        py: 0.8,
                        minWidth: 'auto',
                        whiteSpace: 'nowrap',
                        '&:hover': { color: '#FFF', bgcolor: 'rgba(255, 255, 255, 0.05)' },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    startIcon={<CheckIcon sx={{ fontSize: { xs: 17, sm: 19 } }} />}
                    onClick={handleSave}
                    sx={{
                        background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                        color: '#FFF',
                        px: { xs: 2, sm: 2.5 },
                        py: 0.8,
                        borderRadius: 1.5,
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)',
                            boxShadow: '0 6px 22px rgba(124, 58, 237, 0.6)',
                        },
                    }}
                >
                    Apply Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuickEditElementDialog;
