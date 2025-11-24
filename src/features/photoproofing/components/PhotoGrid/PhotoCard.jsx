import React from 'react';
import { Card, CardMedia, Typography, Box, IconButton, Menu, MenuItem, Fade, Tooltip } from '@mui/material';
import { DeleteOutline, PlaylistAdd, FolderOpen } from '@mui/icons-material';

const PhotoCard = ({ image, index, isLiked, onOpenFullScreen, selectedAlbum, albums, onAddToAlbum, onRemoveFromAlbum }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        setAnchorEl(null);
    };

    const handleAlbumSelect = (event, albumName) => {
        event.stopPropagation();
        onAddToAlbum(albumName, index);
        handleMenuClose();
    };

    const handleRemove = (event) => {
        event.stopPropagation();
        onRemoveFromAlbum(selectedAlbum, index);
    };
    return (
        <Box>
            <Card
                onClick={() => onOpenFullScreen(index)}
                sx={{
                    cursor: 'pointer',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.3)',
                        '& .MuiCardMedia-root': {
                            transform: 'scale(1.1)',
                        },
                        '& .overlay': {
                            opacity: 1,
                        },
                        '& .info-bar': {
                            transform: 'translateY(0)',
                            opacity: 1,
                        },
                        '& .action-btn': {
                            opacity: 1,
                            transform: 'translateY(0)',
                        }
                    }
                }}
            >
                <Box sx={{ position: 'relative', overflow: 'hidden', paddingTop: '75%' }}>
                    <CardMedia
                        component="img"
                        image={image}
                        alt={`Photo ${index + 1}`}
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
                    />

                    {/* Gradient Overlay */}
                    <Box
                        className="overlay"
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(4px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}
                        >
                            <Typography variant="button">View</Typography>
                        </Box>
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
                                <Tooltip title="Add to Album" arrow>
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
                                </Tooltip>
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
                            IMG_{index + 1000}
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
