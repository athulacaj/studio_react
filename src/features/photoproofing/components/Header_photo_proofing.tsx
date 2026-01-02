import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Select, MenuItem, FormControl, Box, Button, Menu, ListItemIcon, ListItemText, CircularProgress, Tooltip } from '@mui/material';
import CameraIcon from '@mui/icons-material/Camera';
import { CreateNewFolder, Download } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { ImageObj } from '../types';
import { useDownloadImages } from '../hooks/useDownloadImages';
import LocalDownloadModal from './LocalDownloadModal';

interface HeaderPhotoProofingProps {
  albums: any,
  selectedAlbum: string,
  onAlbumChange: any,
  allDisplayedImages: ImageObj[],
}

const HeaderPhotoProofing = ({ albums, selectedAlbum, onAlbumChange, allDisplayedImages }: HeaderPhotoProofingProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [localDownloadModalOpen, setLocalDownloadModalOpen] = useState(false);
  const { downloading, progress, currentFileName, downloadToFolder } = useDownloadImages();

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadFolder = async () => {
    handleClose();
    await downloadToFolder(allDisplayedImages, 'cloud', selectedAlbum);
  };

  const handleLocalCopy = () => {
    handleClose();
    setLocalDownloadModalOpen(true);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1100
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box
            component={Link}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', textDecoration: 'none' }}
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
              component={Link}
              to="/about"
              sx={{ color: 'white', fontWeight: 500 }}
            >
              About
            </Button>

            {/* Download Button */}
            <Box sx={{ position: 'relative' }}>
              <Tooltip title={downloading ? `Saving: ${currentFileName}` : "Download to local folder"} arrow>
                <Button
                  variant="contained"
                  disabled={downloading || allDisplayedImages.length === 0}
                  onClick={handleDownloadClick}
                  startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <Download />}
                  sx={{
                    bgcolor: '#a855f7',
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#9333ea',
                    },
                    px: 3
                  }}
                >
                  {downloading ? `Downloading ${progress}%` : `Download (${allDisplayedImages.length})`}
                </Button>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    bgcolor: '#1e293b',
                    color: 'white',
                    borderRadius: '12px',
                    mt: 1,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '& .MuiMenuItem-root': {
                      gap: 1.5,
                      py: 1.5,
                      px: 2.5,
                      '&:hover': {
                        bgcolor: 'rgba(168, 85, 247, 0.2)',
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={handleDownloadFolder}>
                  <ListItemIcon>
                    <CreateNewFolder fontSize="small" sx={{ color: '#2dd4bf' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Download to Folder"
                    secondary="Fetch from cloud to local folder"
                    secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' } }}
                  />
                </MenuItem>
                <MenuItem onClick={handleLocalCopy}>
                  <ListItemIcon>
                    <Download fontSize="small" sx={{ color: '#fbbf24' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Direct Local Copy (Admin)"
                    secondary="Copy from source to destination folder"
                    secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' } }}
                  />
                </MenuItem>
              </Menu>
            </Box>

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

      <LocalDownloadModal
        open={localDownloadModalOpen}
        onClose={() => setLocalDownloadModalOpen(false)}
        images={allDisplayedImages}
        albumName={selectedAlbum}
      />
    </>
  );
};

export default HeaderPhotoProofing;
