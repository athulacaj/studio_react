import React from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    Chip,
    IconButton,
    Fade,
    Tooltip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Edit as EditIcon,
    Close as CloseIcon,
    AutoAwesome as SparklesIcon,
    Image as ImageIcon,
    DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { usePortfolioContext } from '../context/portfolioGlobalContext';
import { usePortfolioStore } from '../store/portfolioStore';
import QuickEditElementDialog from './QuickEditElementDialog';

function setByPath(obj: any, path: string[], value: any): any {
    if (path.length === 0) return value;
    const [head, ...rest] = path;
    const clone = Array.isArray(obj) ? [...obj] : { ...obj };
    clone[head as any] = setByPath((obj as any)[head], rest, value);
    return clone;
}

function deleteByPath(obj: any, path: string[]): any {
    if (path.length === 0) return obj;
    if (path.length === 1) {
        if (Array.isArray(obj)) {
            const clone = [...obj];
            clone.splice(Number(path[0]), 1);
            return clone;
        } else {
            const clone = { ...obj };
            delete clone[path[0]];
            return clone;
        }
    }
    const [head, ...rest] = path;
    const clone = Array.isArray(obj) ? [...obj] : { ...obj };
    clone[head as any] = deleteByPath((obj as any)[head], rest);
    return clone;
}

export const PortfolioPreview: React.FC = () => {
    const theme = useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { managePortfolioController } = usePortfolioContext();

    const {
        previewMode,
        isDragging,
        blobUrl,
        iframeRef,
        setMobileView,
        handleDataChange,
        portfolioData,
    } = managePortfolioController;

    const {
        selectedElement,
        setSelectedElement,
        isQuickEditOpen,
        setIsQuickEditOpen,
        uploadedImages,
    } = usePortfolioStore();

    const isFramedMockup = !isMobileScreen && previewMode === 'mobile';

    const handleApplyEdit = (path: string[], newValue: any) => {
        const current = portfolioData;
        const newData = setByPath(current, path, newValue);
        handleDataChange(newData);
        if (selectedElement) {
            setSelectedElement({
                ...selectedElement,
                value: newValue,
            });
        }
    };

    const handleDeleteElement = () => {
        if (!selectedElement) return;
        const current = portfolioData;
        const newData = deleteByPath(current, selectedElement.path);
        handleDataChange(newData);
        setSelectedElement(null);
    };

    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#0f172a', position: 'relative', height: '100%', overflow: 'hidden' }}>
            <Box
                sx={{
                    flexGrow: 1,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    p: isFramedMockup ? 2 : 0,
                    pointerEvents: isDragging ? 'none' : 'auto',
                }}
            >
                {blobUrl && (
                    <Box
                        sx={{
                            height: isFramedMockup ? '95vh' : '100%',
                            width: isFramedMockup ? 'auto' : '100%',
                            minWidth: isFramedMockup ? '360px' : 'auto',
                            aspectRatio: isFramedMockup ? '375 / 812' : 'auto',
                            maxHeight: '100%',
                            bgcolor: '#fff',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: isFramedMockup ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
                            borderRadius: isFramedMockup ? '16px' : '0',
                            overflow: 'hidden',
                            border: isFramedMockup ? '6px solid #1e293b' : 'none',
                            margin: 'auto'
                        }}
                    >
                        <iframe
                            ref={iframeRef}
                            src={blobUrl}
                            title="Live Preview"
                            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                        />
                    </Box>
                )}
            </Box>

            {/* ── Selected Element Bottom Action Bar ── */}
            {selectedElement && (
                <Fade in={Boolean(selectedElement)}>
                    <Paper
                        elevation={8}
                        sx={{
                            position: 'absolute',
                            bottom: isMobileScreen ? 20 : 28,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 40,
                            maxWidth: { xs: '94%', sm: 580 },
                            width: 'max-content',
                            bgcolor: 'rgba(11, 19, 43, 0.95)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(192, 132, 252, 0.4)',
                            borderRadius: 2.5,
                            py: 0.8,
                            px: { xs: 1.5, sm: 2 },
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(124, 58, 237, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 1, sm: 1.5 },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {/* Section / Breadcrumb Badge */}
                        <Chip
                            size="small"
                            icon={selectedElement.isImage ? <ImageIcon sx={{ fontSize: '13px !important', color: '#38BDF8 !important' }} /> : <SparklesIcon sx={{ fontSize: '13px !important', color: '#C084FC !important' }} />}
                            label={selectedElement.label || selectedElement.section}
                            sx={{
                                bgcolor: 'rgba(124, 58, 237, 0.25)',
                                color: '#C084FC',
                                border: '1px solid rgba(168, 85, 247, 0.35)',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                borderRadius: 1.5,
                                maxWidth: { xs: 110, sm: 180 },
                                '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                            }}
                        />

                        {/* Selected Text Value Preview */}
                        <Tooltip title={typeof selectedElement.value === 'object' && selectedElement.value !== null ? 'Contains multiple editable fields' : String(selectedElement.value || '')} arrow placement="top">
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#FFF',
                                    fontWeight: 600,
                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                    maxWidth: { xs: 100, sm: 180 },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {selectedElement.isImage 
                                    ? 'Image Asset' 
                                    : typeof selectedElement.value === 'object' && selectedElement.value !== null 
                                        ? 'Grouped Elements' 
                                        : `"${String(selectedElement.value || '').trim()}"`}
                            </Typography>
                        </Tooltip>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, ml: 1 }}>
                            <Tooltip title="Edit Content" arrow placement="top">
                                <IconButton
                                    size="small"
                                    onClick={() => setIsQuickEditOpen(true)}
                                    sx={{
                                        color: '#FFF',
                                        background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                                        boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                                        p: 0.6,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)',
                                            transform: 'scale(1.05)',
                                        },
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <EditIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete Element" arrow placement="top">
                                <IconButton
                                    size="small"
                                    onClick={handleDeleteElement}
                                    sx={{
                                        color: '#EF4444',
                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                        p: 0.6,
                                        '&:hover': {
                                            bgcolor: 'rgba(239, 68, 68, 0.2)',
                                            transform: 'scale(1.05)',
                                        },
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <DeleteIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Dismiss Button */}
                        <IconButton
                            size="small"
                            onClick={() => setSelectedElement(null)}
                            sx={{
                                color: '#94A3B8',
                                p: 0.5,
                                '&:hover': { color: '#FFF', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                            }}
                            title="Dismiss Selection"
                        >
                            <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Paper>
                </Fade>
            )}

            {/* Mobile Quick Switch Floating Action Pill (When no element is selected) */}
            {isMobileScreen && !selectedElement && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 30,
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setMobileView('editor')}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4), 0 2px 6px rgba(0,0,0,0.3)',
                            color: '#FFF',
                            px: 2.5,
                            py: 1,
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            letterSpacing: '0.02em',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 28px rgba(124, 58, 237, 0.6)',
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                            }
                        }}
                    >
                        Edit Content
                    </Button>
                </Box>
            )}

            {/* Quick Edit Dialog */}
            <QuickEditElementDialog
                open={isQuickEditOpen}
                onClose={() => setIsQuickEditOpen(false)}
                selectedElement={selectedElement}
                onApply={handleApplyEdit}
                uploadedImages={uploadedImages}
            />
        </Box>
    );
};

export default PortfolioPreview;

