import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface FullScreenLoaderProps {
    show: boolean;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ show }) => {
    return (
        <AnimatePresence>
            {show && (
                <Box
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 100,
                        backgroundColor: 'rgba(6, 8, 15, 0.4)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 3
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            width: 80,
                            height: 80,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {/* Outer Glow Ring */}
                        <Box
                            component={motion.div}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            sx={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                border: '2px solid #a78bfa',
                                filter: 'blur(4px)'
                            }}
                        />

                        {/* Spinning Loader */}
                        <Box
                            component={motion.div}
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: '50%',
                                border: '3px solid transparent',
                                borderTopColor: '#a78bfa',
                                borderRightColor: '#a78bfa',
                                position: 'relative',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#a78bfa',
                                    boxShadow: '0 0 15px #a78bfa'
                                }
                            }}
                        />
                    </Box>

                    <Typography
                        component={motion.p}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        variant="body1"
                        sx={{
                            color: 'white',
                            fontWeight: 500,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            opacity: 0.8
                        }}
                    >
                        Loading...
                    </Typography>
                </Box>
            )}
        </AnimatePresence>
    );
};

export default FullScreenLoader;
