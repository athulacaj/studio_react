import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CameraIcon from '@mui/icons-material/Camera';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useUserStore } from '../../features/auth/store/userStore';

const GlobalNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { userProfile } = useUserStore();

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const pages = [
    { name: 'Studio Dashboard', path: '/private/studio' },
    { name: 'Portfolio Builder', path: '/private/portfolio-builder' },
  ];

  return (
    <AppBar position="sticky" sx={{
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      zIndex: (theme) => theme.zIndex.drawer + 1
    }}>
      <Toolbar>
        {/* Mobile Menu Icon */}
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="navigation menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          {/* <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiPaper-root': {
                backgroundColor: '#1e293b',
                color: 'white',
              }
            }}
          >
            {pages.map((page) => (
              <MenuItem 
                key={page.name} 
                onClick={() => {
                  handleCloseNavMenu();
                  navigate(page.path);
                }}
                selected={location.pathname.startsWith(page.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  }
                }}
              >
                <Typography textAlign="center">{page.name}</Typography>
              </MenuItem>
            ))}
          </Menu> */}
        </Box>

        {/* Mobile Logo */}
        <Box
          component={Link}
          to="/private/studio"
          sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1, alignItems: 'center', gap: 1, cursor: 'pointer', textDecoration: 'none' }}
        >
          <CameraIcon sx={{ color: '#a855f7', fontSize: 28 }} />
        </Box>

        {/* Desktop Logo */}
        <Box
          component={Link}
          to="/private/studio"
          sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, cursor: 'pointer', textDecoration: 'none', mr: 4 }}
        >
          <CameraIcon sx={{ color: '#a855f7', fontSize: 32 }} />
          <Typography
            variant="h6"
            noWrap
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

        {/* Desktop Menu */}
        {/* <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          {pages.map((page) => (
            <Button
              key={page.name}
              onClick={() => navigate(page.path)}
              sx={{
                my: 2,
                color: location.pathname.startsWith(page.path) ? '#a855f7' : 'white',
                display: 'block',
                fontWeight: location.pathname.startsWith(page.path) ? 600 : 400,
                borderBottom: location.pathname.startsWith(page.path) ? '2px solid #a855f7' : '2px solid transparent',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  borderBottom: '2px solid #a855f7',
                }
              }}
            >
              {page.name}
            </Button>
          ))}
        </Box> */}

        {/* User Menu */}
        <Box sx={{ flex: 1 }}></Box>
        <Box sx={{ flexGrow: 0 }}>
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: '#a855f7', width: 36, height: 36 }}>
              {userProfile?.name?.charAt(0)?.toUpperCase() || <AccountCircleIcon />}
            </Avatar>
          </IconButton>
          <Menu
            sx={{
              mt: '45px',
              '& .MuiPaper-root': {
                backgroundColor: '#1e293b',
                color: 'white',
                minWidth: '200px',
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{userProfile?.name || 'User'}</Typography>
              <Typography variant="body2" sx={{ color: 'gray' }}>{userProfile?.email}</Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <MenuItem onClick={handleLogout} sx={{ mt: 1, '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }, color: '#ef4444' }}>
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default GlobalNavbar;
