import React from 'react';
import { Box } from '@mui/material';

const VividView: React.FC = () => {
  return (
    <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/html/vivid/vivid.html"
        title="Vivid View"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
      />
    </Box>
  );
};

export default VividView;
