import React from 'react';
import { Box, Typography, Container, Grid, IconButton } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 6,
                px: 2,
                mt: 'auto',
                backgroundColor: '#0f172a',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between">
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" color="white" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Studio<span style={{ color: '#a855f7' }}>React</span>
                        </Typography>
                        <Typography variant="body2" color="gray" sx={{ maxWidth: 300 }}>
                            Professional photo proofing and gallery management for modern photographers.
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" color="white" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Contact
                        </Typography>
                        <Typography variant="body2" color="gray">
                            123 Photography Lane<br />
                            Creative City, ST 12345<br />
                            hello@studioreact.com
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" color="white" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Follow Us
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton sx={{ color: 'gray', '&:hover': { color: '#a855f7' } }}>
                                <InstagramIcon />
                            </IconButton>
                            <IconButton sx={{ color: 'gray', '&:hover': { color: '#a855f7' } }}>
                                <TwitterIcon />
                            </IconButton>
                            <IconButton sx={{ color: 'gray', '&:hover': { color: '#a855f7' } }}>
                                <FacebookIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                    <Typography variant="body2" color="gray">
                        {'Copyright © '}
                        StudioReact {' '}
                        {new Date().getFullYear()}
                        {'. All rights reserved.'}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
