import React from 'react';
import { Card, CardMedia, Typography, Box, IconButton, Menu, MenuItem, Fade, Tooltip } from '@mui/material';
import { DeleteOutline, PlaylistAdd, FolderOpen, Fullscreen, AddPhotoAlternate, CheckCircle, RemoveCircle } from '@mui/icons-material';

import { ImageObj } from '../../types';
import { usePhotoProofingStore } from '../../store/usePhotoProofingStore';
import { CachedImage } from '../../../../shared/utils/MakeGlobalImageCache';

interface PhotoCardProps {
    imageObj: ImageObj;
    isLiked: boolean;
    onOpenFullScreen: (imageObj: ImageObj) => void
}

const PhotoCard: React.FC<PhotoCardProps> = ({ imageObj, isLiked, onOpenFullScreen }) => {

    const { albums, selectedAlbum, handleAddToAlbum, handleRemoveFromAlbum, categories } = usePhotoProofingStore();
    const { toAddWhichAlbum } = usePhotoProofingStore();
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [isAdded, setIsAdded] = React.useState(false);
    const open = Boolean(anchorEl);
    const image = imageObj.src || imageObj.thumbnailLink;

    // Guard: record when the card first enters hover so we can ignore
    // button clicks that fire in the same tap (mobile touch quirk).
    const hoverStartRef = React.useRef<number>(0);
    const isSameTapAsHover = () => Date.now() - hoverStartRef.current < 350;

    // Is this image already in the selected target album?
    // Album entries are always JSON.stringify(imageObj), so we parse to compare by id.
    const isInAlbum = !!(toAddWhichAlbum && albums[toAddWhichAlbum]?.some((entry: string) => {
        try { return JSON.parse(entry).id === imageObj.id; } catch { return entry === imageObj.id; }
    }));


    const flashAdded = () => {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (event?: object) => {
        if (event && 'stopPropagation' in event) (event as any).stopPropagation();
        setAnchorEl(null);
    };

    const handleAlbumSelect = (event: React.MouseEvent<HTMLElement>, albumName: string) => {
        event.stopPropagation();
        handleAddToAlbum(albumName, imageObj);
        handleMenuClose();
    };

    const handleRemove = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        handleRemoveFromAlbum(selectedAlbum, imageObj);
    };

    const handleDoubleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        if (toAddWhichAlbum) {
            if (isInAlbum) {
                handleRemoveFromAlbum(toAddWhichAlbum, imageObj);
            } else {
                handleAddToAlbum(toAddWhichAlbum, imageObj);
                flashAdded();
            }
        }
    };

    const handleFullScreenClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        if (isSameTapAsHover()) return;
        onOpenFullScreen(imageObj);
    };

    const handleAddToAlbumClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        if (isSameTapAsHover()) return;
        if (toAddWhichAlbum) {
            handleAddToAlbum(toAddWhichAlbum, imageObj);
            flashAdded();
        }
    };

    const handleRemoveFromTargetAlbumClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        if (isSameTapAsHover()) return;
        if (toAddWhichAlbum) {
            handleRemoveFromAlbum(toAddWhichAlbum, imageObj);
        }
    };
    return (
        <Box>
            <Card
                onDoubleClick={handleDoubleClick}
                onClick={() => { }} // Allows mobile Safari to treat the card as clickable to apply hover
                onMouseEnter={() => { hoverStartRef.current = Date.now(); }}
                onMouseLeave={() => { hoverStartRef.current = 0; }}
                sx={{
                    cursor: 'pointer',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    transform: 'translateY(0)',
                    '&:hover, &:focus-within': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px -5px rgba(0,0,0,0.3)',
                        '& .MuiCardMedia-root': {
                            transform: 'scale(1.1) !important',
                        },
                        '& .overlay': {
                            opacity: 1,
                            pointerEvents: 'auto',
                        },
                        '& .action-btn': {
                            opacity: 1,
                            transform: 'translateY(0)',
                        },
                        '& .info-bar': {
                            opacity: 1,
                            transform: 'translateY(0)',
                        }
                    }
                }}
            >
                <Box sx={{ position: 'relative', overflow: 'hidden', paddingTop: '75%' }}>
                    <CachedImage
                        src={image}
                        alt={imageObj.name}
                        loading="lazy"
                        className="MuiCardMedia-root"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: 'scale(1)',
                        }}
                    />
                    {/* <CardMedia
                        component="img"
                        image={image}
                        alt={imageObj.name}
                        loading="lazy"
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    /> */}

                    {/* Gradient Overlay — hidden and non-interactive when not hovered */}
                    <Box
                        className="overlay"
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)',
                            opacity: 0,
                            pointerEvents: 'none',
                            transition: 'opacity 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1.5,
                            zIndex: 5,
                        }}
                    >
                        {/* Fullscreen Button */}
                        <Tooltip title="View Full Screen" arrow>
                            <IconButton
                                onClick={handleFullScreenClick}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.35)',
                                        transform: 'scale(1.15)',
                                    },
                                    width: 46,
                                    height: 46,
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                                }}
                            >
                                <Fullscreen />
                            </IconButton>
                        </Tooltip>

                        {/* Add / Remove from target Album Button */}
                        {toAddWhichAlbum && (
                            isInAlbum ? (
                                // Already in album — show Remove button
                                <Tooltip title={`Remove from "${categories[toAddWhichAlbum].name}"`} arrow>
                                    <IconButton
                                        onClick={handleRemoveFromTargetAlbumClick}
                                        sx={{
                                            bgcolor: 'rgba(239,68,68,0.3)',
                                            backdropFilter: 'blur(8px)',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: 'rgba(239,68,68,0.55)',
                                                transform: 'scale(1.15)',
                                                boxShadow: '0 0 18px rgba(239,68,68,0.6)',
                                            },
                                            width: 46,
                                            height: 46,
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 0 12px rgba(239,68,68,0.4)',
                                            border: '1px solid rgba(239,68,68,0.5)',
                                        }}
                                    >
                                        <RemoveCircle sx={{ color: '#fca5a5' }} />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                // Not in album — show Add button
                                <Tooltip title={isAdded ? `Added to "${categories[toAddWhichAlbum].name}"!` : `Add to "${categories[toAddWhichAlbum].name}"`} arrow>
                                    <IconButton
                                        onClick={handleAddToAlbumClick}
                                        sx={{
                                            bgcolor: isAdded ? 'rgba(34,197,94,0.35)' : 'rgba(167,139,250,0.3)',
                                            backdropFilter: 'blur(8px)',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: isAdded ? 'rgba(34,197,94,0.5)' : 'rgba(167,139,250,0.55)',
                                                transform: 'scale(1.15)',
                                                boxShadow: isAdded
                                                    ? '0 0 18px rgba(34,197,94,0.6)'
                                                    : '0 0 16px rgba(167,139,250,0.5)',
                                            },
                                            width: 46,
                                            height: 46,
                                            transition: 'all 0.3s ease',
                                            boxShadow: isAdded
                                                ? '0 0 14px rgba(34,197,94,0.55)'
                                                : '0 4px 16px rgba(0,0,0,0.3)',
                                            border: isAdded
                                                ? '1px solid rgba(34,197,94,0.6)'
                                                : '1px solid rgba(167,139,250,0.4)',
                                            transform: isAdded ? 'scale(1.12)' : 'scale(1)',
                                        }}
                                    >
                                        {isAdded ? <CheckCircle sx={{ color: '#4ade80' }} /> : <AddPhotoAlternate />}
                                    </IconButton>
                                </Tooltip>
                            )
                        )}
                    </Box>

                    {/* Action Button (Add/Remove) */}
                    <Box
                        className="action-btn"
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 10,
                            opacity: 0,
                            transform: 'translateY(-10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        {selectedAlbum === 'all' ? (
                            <>
                                {/* <Tooltip title="Add to Album" arrow>
                                    <IconButton
                                        onClick={handleMenuOpen}
                                        sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(8px)',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.3)',
                                                transform: 'scale(1.1)',
                                            },
                                            width: 40,
                                            height: 40,
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                        }}
                                    >
                                        <PlaylistAdd />
                                    </IconButton>
                                </Tooltip> */}
                                <Menu
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleMenuClose}
                                    TransitionComponent={Fade}
                                    PaperProps={{
                                        sx: {
                                            bgcolor: 'rgba(30, 30, 30, 0.95)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            mt: 1,
                                            minWidth: 180,
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                            '& .MuiMenuItem-root': {
                                                color: 'white',
                                                fontSize: '0.9rem',
                                                py: 1.5,
                                                px: 2,
                                                gap: 1.5,
                                                '&:hover': {
                                                    bgcolor: 'rgba(255,255,255,0.1)',
                                                },
                                            },
                                        }
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    {Object.keys(albums).length > 0 ? (
                                        Object.keys(albums).map((album) => (
                                            <MenuItem key={album} onClick={(e) => handleAlbumSelect(e, album)}>
                                                <FolderOpen fontSize="small" sx={{ color: '#a78bfa' }} />
                                                {album}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled sx={{ opacity: 0.7 }}>
                                            No albums created
                                        </MenuItem>
                                    )}
                                </Menu>
                            </>
                        ) : (
                            <Tooltip title="Remove from Album" arrow>
                                <IconButton
                                    onClick={handleRemove}
                                    sx={{
                                        bgcolor: 'rgba(239, 68, 68, 0.2)', // Red tint
                                        backdropFilter: 'blur(8px)',
                                        color: '#fca5a5', // Light red
                                        '&:hover': {
                                            bgcolor: 'rgba(239, 68, 68, 0.4)',
                                            color: '#fff',
                                            transform: 'scale(1.1) rotate(90deg)',
                                        },
                                        width: 40,
                                        height: 40,
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)'
                                    }}
                                >
                                    <DeleteOutline />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    {/* Info Bar (Like status, etc) */}
                    <Box
                        className="info-bar"
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transform: 'translateY(20px)',
                            opacity: 0,
                            transition: 'all 0.3s ease',
                            zIndex: 2
                        }}
                    >
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 500, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            {imageObj.name}
                        </Typography>
                        {isLiked && (
                            <Box sx={{
                                bgcolor: 'rgba(239, 68, 68, 0.9)',
                                borderRadius: '50%',
                                p: 0.5,
                                display: 'flex'
                            }}>
                                <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>❤️</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Card>
        </Box>
    );
};

export default PhotoCard;
