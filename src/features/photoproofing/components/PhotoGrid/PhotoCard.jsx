import React from 'react';
import { Card, CardMedia, Typography, Box } from '@mui/material';

const PhotoCard = ({ image, index, isLiked, onOpenFullScreen }) => {
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
