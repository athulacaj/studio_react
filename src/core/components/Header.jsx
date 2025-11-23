import React from 'react';
import { AppBar, Toolbar, Typography, Select, MenuItem, FormControl, InputLabel, Box, Button } from '@mui/material';
import CameraIcon from '@mui/icons-material/Camera';
import { useNavigate } from 'react-router-dom';

const Header = ({ albums, selectedAlbum, onAlbumChange }) => {
  const navigate = useNavigate();
  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <CameraIcon sx={{ color: '#a855f7', fontSize: 32 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.025em',
              background: 'linear-gradient(to right, #fff, #cbd5e1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Studio<span style={{ color: '#a855f7', WebkitTextFillColor: '#a855f7' }}>React</span>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => navigate('/about')}
            sx={{ color: 'white', fontWeight: 500 }}
          >
            About
          </Button>

          <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
            <Select
              labelId="album-select-label"
              id="album-select"
              value={selectedAlbum}
              onChange={onAlbumChange}
              displayEmpty
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#a855f7',
                },
                '.MuiSvgIcon-root': {
                  color: 'white',
                },
                borderRadius: '20px',
                height: '40px',
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#1e293b',
                    color: 'white',
                    '& .MuiMenuItem-root': {
                      '&:hover': {
                        bgcolor: 'rgba(168, 85, 247, 0.2)',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(168, 85, 247, 0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(168, 85, 247, 0.4)',
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="all">All Photos</MenuItem>
              {Object.keys(albums).map((albumName) => (
                <MenuItem key={albumName} value={albumName}>
                  {albumName.charAt(0).toUpperCase() + albumName.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

