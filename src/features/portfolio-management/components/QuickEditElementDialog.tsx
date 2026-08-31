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
    const [localValue, setLocalValue] = useState<any>('');
    const [showAssetGallery, setShowAssetGallery] = useState<boolean>(false);
    const [activeAssetPath, setActiveAssetPath] = useState<string[] | null>(null);

    useEffect(() => {
        if (selectedElement) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalValue(selectedElement.value ?? '');
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowAssetGallery(false);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveAssetPath(null);
        }
    }, [selectedElement, open]);

    if (!selectedElement) return null;

    const handleSave = () => {
        onApply(selectedElement.path, localValue);
        onClose();
    };

    const handleFieldChange = (path: string[], newValue: string) => {
        if (path.length === 0) {
            setLocalValue(newValue);
            return;
        }
        setLocalValue((prev: any) => {
            if (typeof prev !== 'object' || prev === null) return newValue;
            const clone = Array.isArray(prev) ? [...prev] : { ...prev };
            let current = clone;
            for (let i = 0; i < path.length - 1; i++) {
                current[path[i]] = Array.isArray(current[path[i]]) ? [...current[path[i]]] : { ...current[path[i]] };
                current = current[path[i]];
            }
            current[path[path.length - 1]] = newValue;
            return clone;
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent, isMultiline: boolean) => {
        if (e.key === 'Enter' && (!isMultiline || e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
    };

    const handleSelectAsset = (img: UploadedImage) => {
        const finalUrl = img.fileKey
            ? `${import.meta.env.VITE_R2_BASEURL}/${img.fileKey}`
            : img.url;
        handleFieldChange(activeAssetPath || [], finalUrl);
        setShowAssetGallery(false);
    };

    const renderAssetGallery = () => {
        return (
            <Collapse in={showAssetGallery} sx={{ mt: 1 }}>
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
        );
    };

    const renderField = (key: string, val: any, path: string[]) => {
        if (typeof val === 'object' && val !== null) {
            return (
                <Box key={path.join('.')} sx={{ mb: 2 }}>
                    {key && (
                        <Typography variant="subtitle2" sx={{ color: '#C084FC', mb: 1.5, textTransform: 'capitalize', fontWeight: 600 }}>
                            {key}
                        </Typography>
                    )}
                    <Box sx={{ pl: key ? 2 : 0, borderLeft: key ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                        {Object.entries(val).map(([k, v]) => renderField(k, v, [...path, k]))}
                    </Box>
                </Box>
            );
        }

        const isImageField = (typeof val === 'string' && (val.startsWith('http') || val.startsWith('/') || /\.(jpeg|jpg|png|webp|gif|svg)$/i.test(val) || /image|img|photo|logo|banner|pic|src/i.test(key))) || (path.length === 0 && selectedElement.isImage);
        const isMultiline = !isImageField && (String(val).length > 55 || /description|bio|about|content|message|quote|review|text|summary/i.test(key));
        const pathStr = path.join('.');
        const isGalleryOpen = showAssetGallery && activeAssetPath?.join('.') === pathStr;

        if (isImageField) {
            return (
                <Box key={pathStr} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    {val && (
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
                                src={val}
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
                        label={key || 'Image URL'}
                        value={val}
                        onChange={(e) => handleFieldChange(path, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, false)}
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

                    <Button
                        variant="outlined"
                        startIcon={<GalleryIcon />}
                        endIcon={isGalleryOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => {
                            if (isGalleryOpen) {
                                setShowAssetGallery(false);
                            } else {
                                setActiveAssetPath(path);
                                setShowAssetGallery(true);
                            }
                        }}
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
                        {isGalleryOpen ? 'Hide Assets Library' : `Choose From Assets (${uploadedImages.length})`}
                    </Button>
                    
                    {isGalleryOpen && renderAssetGallery()}
                </Box>
            );
        }

        return (
            <Box key={pathStr} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                <TextField
                    fullWidth
                    multiline={isMultiline}
                    rows={isMultiline ? 4 : 1}
                    label={key || selectedElement.fieldKey}
                    value={val}
                    onChange={(e) => handleFieldChange(path, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, isMultiline)}
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
                <Typography variant="caption" sx={{ color: '#64748B', px: 0.5, mt: -1 }}>
                    {isMultiline ? 'Tip: Press Ctrl+Enter or Cmd+Enter to apply changes.' : 'Tip: Press Enter to apply changes.'}
                </Typography>
            </Box>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
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
            <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, pt: { xs: 2, sm: 2.5 }, bgcolor: 'rgba(3, 9, 18, 0.3)', maxHeight: '60vh' }}>
                {renderField('', localValue, [])}
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
