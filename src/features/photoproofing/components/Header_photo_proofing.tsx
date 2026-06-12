import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Box,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  Drawer,
  Stack,
  Divider,
} from '@mui/material';
import CameraIcon from '@mui/icons-material/Camera';
import { CreateNewFolder, Download, Close, Menu as MenuIcon, Info as InfoIcon, PermMedia as AlbumIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { AlbumCategory, ImageObj } from '../types';
import { useDownloadImages } from '../hooks/useDownloadImages';
import LocalDownloadModal from './LocalDownloadModal';

interface HeaderPhotoProofingProps {
  albums: Record<string, string[]>,
  categories: Record<string, AlbumCategory>,
  selectedAlbum: string,
  onAlbumChange: any,
  allDisplayedImages: ImageObj[],
}

const HeaderPhotoProofing = ({ albums, categories, selectedAlbum, onAlbumChange, allDisplayedImages }: HeaderPhotoProofingProps) => {
  // const theme = useTheme();
  // We use CSS breakpoints for layout hiding, but keep isMobile logic if needed for JS control
  // currently primarily handled via Sx props, but keeping the hook call is standard for future proofing or explicit logic
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localDownloadModalOpen, setLocalDownloadModalOpen] = useState(false);

  const { downloading, progress, downloadToFolder, cancelDownload } = useDownloadImages();


  const handleDownloadFolder = async () => {
    await downloadToFolder(allDisplayedImages, 'cloud');
  };

  const handleLocalCopy = () => {
    setLocalDownloadModalOpen(true);
  };

  const toggleMobileMenu = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setMobileMenuOpen(open);
  };

  interface DownloadButtonProps {
    fullWidth?: boolean;
    downloading: boolean;
    progress: number;
    imageCount: number;
    onCancel: () => void;
    onDownloadFolder: () => void;
    onLocalCopy: () => void;
  }

  const DownloadButton = ({
    fullWidth = false,
    downloading,
    progress,
    imageCount,
    onCancel,
    onDownloadFolder,
    onLocalCopy
  }: DownloadButtonProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleFolderClick = () => {
      handleClose();
      onDownloadFolder();
    };

    const handleLocalClick = () => {
      handleClose();
      onLocalCopy();
    };

    return (
      <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
        <Tooltip title={downloading ? "Cancel Download" : "Download to local folder"} arrow placement={fullWidth ? "bottom" : "top"}>
          <Button
            variant="contained"
            disabled={imageCount === 0}
            fullWidth={fullWidth}
            onClick={(e) => {
              if (downloading) {
                onCancel();
              } else {
                handleClick(e);
              }
            }}
            startIcon={downloading ? <Close /> : <Download />}
            sx={{
              bgcolor: downloading ? '#ef4444' : '#a855f7', // Red if downloading
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: downloading ? '#dc2626' : '#9333ea',
              },
              px: 3,
              py: fullWidth ? 1.5 : 0.75,
              boxShadow: downloading ? '0 0 15px rgba(239, 68, 68, 0.5)' : '0 4px 14px 0 rgba(168, 85, 247, 0.39)',
            }}
          >
            {downloading ? `Cancel (${progress}%)` : `Download (${imageCount})`}
          </Button>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              bgcolor: '#1e293b',
              color: 'white',
              borderRadius: '12px',
              mt: 1,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minWidth: '220px',
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
          <MenuItem onClick={handleFolderClick}>
            <ListItemIcon>
              <CreateNewFolder fontSize="small" sx={{ color: '#2dd4bf' }} />
            </ListItemIcon>
            <ListItemText
              primary="Download to Folder"
              secondary="Fetch from cloud to local folder"
              secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' } }}
            />
          </MenuItem>
          <MenuItem onClick={handleLocalClick}>
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
    );
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          zIndex: 1100,
          transition: 'all 0.3s ease'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          {/* Logo Section */}
          <Box
            component={Link}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', textDecoration: 'none' }}
          >
            <CameraIcon sx={{ color: '#a855f7', fontSize: { xs: 28, md: 32 } }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.025em',
                background: 'linear-gradient(to right, #fff, #cbd5e1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              Studio<span style={{ color: '#a855f7', WebkitTextFillColor: '#a855f7' }}>React</span>
            </Typography>
          </Box>

          {/* Desktop Controls */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Button
              component={Link}
              to="/about"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 500,
                '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              About
            </Button>

            <DownloadButton
              downloading={downloading}
              progress={progress}
              imageCount={allDisplayedImages.length}
              onCancel={cancelDownload}
              onDownloadFolder={handleDownloadFolder}
              onLocalCopy={handleLocalCopy}
            />

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
                    transition: 'border-color 0.2s'
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
                        '&:hover': { bgcolor: 'rgba(168, 85, 247, 0.2)' },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(168, 85, 247, 0.3)',
                          '&:hover': { bgcolor: 'rgba(168, 85, 247, 0.4)' },
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

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={toggleMobileMenu(true)}
            sx={{ display: { md: 'none' }, ml: 2 }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu(false)}
        PaperProps={{
          sx: {
            width: '85%',
            maxWidth: '300px',
            bgcolor: '#0f172a',
            color: 'white',
            borderLeft: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <Box
          sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}
          role="presentation"
        >
          {/* Drawer Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CameraIcon sx={{ color: '#a855f7' }} />
              Studio<span style={{ color: '#a855f7' }}>React</span>
            </Typography>
            <IconButton onClick={toggleMobileMenu(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

          <Stack spacing={3}>
            {/* Album Selector Mobile */}
            <Box>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, mb: 1, display: 'block' }}>
                Current Album
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedAlbum}
                  onChange={(e) => {
                    onAlbumChange(e);
                  }}
                  displayEmpty
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#a855f7' },
                    '.MuiSvgIcon-root': { color: 'white' },
                    borderRadius: '12px',
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#1e293b',
                        color: 'white',
                      }
                    }
                  }}
                >
                  <MenuItem value="all">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AlbumIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} /> All Photos
                    </Box>
                  </MenuItem>
                  {Object.keys(categories).map((albumKey) => (
                    <MenuItem key={albumKey} value={albumKey}>
                      {categories[albumKey].name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Actions */}
            <Box>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, mb: 1, display: 'block' }}>
                Actions
              </Typography>
              <Stack spacing={2}>
                <DownloadButton
                  fullWidth={true}
                  downloading={downloading}
                  progress={progress}
                  imageCount={allDisplayedImages.length}
                  onCancel={cancelDownload}
                  onDownloadFolder={handleDownloadFolder}
                  onLocalCopy={handleLocalCopy}
                />

                <Button
                  component={Link}
                  to="/about"
                  fullWidth
                  variant="outlined"
                  startIcon={<InfoIcon />}
                  onClick={toggleMobileMenu(false)}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    py: 1,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                  }}
                >
                  About
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Drawer>

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
