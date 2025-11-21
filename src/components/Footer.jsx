import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ p: 2, mt: 'auto', backgroundColor: '#f5f5f5' }}>
      <Typography variant="body2" color="text.secondary" align="center">
        {'Copyright © '}
        Gen Photo Proofing {' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    </Box>
  );
};

export default Footer;
