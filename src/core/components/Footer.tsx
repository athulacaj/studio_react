import React from 'react';
import { Box, Typography, Container, Grid, IconButton } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import CameraIcon from '@mui/icons-material/Camera';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        background: 'linear-gradient(180deg, #030912 0%, #020710 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(157, 78, 221, 0.3), transparent)',
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CameraIcon sx={{ color: '#9D4EDD', fontSize: 22 }} />
              <Typography variant="h6" sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #F8FAFC, #C084FC)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                mizhiv
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 300 }}>
              Premium photo proofing and gallery management for wedding & event photographers.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
              Contact
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.8 }}>
              hello@mizhiv.com
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[InstagramIcon, TwitterIcon, FacebookIcon].map((Icon, i) => (
                <IconButton
                  key={i}
                  sx={{
                    color: '#64748B',
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      color: '#C084FC',
                      background: 'rgba(157, 78, 221, 0.1)',
                      boxShadow: '0 0 16px rgba(157, 78, 221, 0.15)',
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.04)', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>
            {'© '}
            mizhiv {' '}
            {new Date().getFullYear()}
            {'. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

