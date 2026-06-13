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
      background: 'rgba(3, 9, 18, 0.9)',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      zIndex: (theme) => theme.zIndex.drawer + 1
    }}>
      <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
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
                backgroundColor: '#0F1A2E',
                color: 'white',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
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
                    backgroundColor: 'rgba(157, 78, 221, 0.15)',
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
          <Box component="img" src="/images/logo_small.png" alt="mizhiv logo" sx={{ height: 32, width: 'auto', borderRadius: '8px' }} />
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #F8FAFC 0%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            mizhiv
          </Typography>
        </Box>

        {/* Desktop Logo */}
        <Box
          component={Link}
          to="/private/studio"
          sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, cursor: 'pointer', textDecoration: 'none', mr: 4 }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(157, 78, 221, 0.12)',
              border: '1px solid rgba(157, 78, 221, 0.2)',
              overflow: 'hidden'
            }}
          >
            <Box component="img" src="/images/logo_small.png" alt="mizhiv logo" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.025em',
              background: 'linear-gradient(135deg, #F8FAFC 0%, #CBD5E1 50%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            mizhiv
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
                color: location.pathname.startsWith(page.path) ? '#C084FC' : '#94A3B8',
                display: 'block',
                fontWeight: location.pathname.startsWith(page.path) ? 600 : 400,
                borderBottom: location.pathname.startsWith(page.path) ? '2px solid #9D4EDD' : '2px solid transparent',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'rgba(157, 78, 221, 0.08)',
                  borderBottom: '2px solid #9D4EDD',
                  color: '#C084FC',
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
          <IconButton
            onClick={handleOpenUserMenu}
            sx={{
              p: 0.5,
              border: '2px solid transparent',
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: 'rgba(157, 78, 221, 0.4)',
              },
            }}
          >
            <Avatar
              sx={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                width: 36,
                height: 36,
                fontSize: '0.9rem',
                fontWeight: 700,
                boxShadow: '0 0 16px rgba(157, 78, 221, 0.25)',
              }}
            >
              {userProfile?.name?.charAt(0)?.toUpperCase() || <AccountCircleIcon />}
            </Avatar>
          </IconButton>
          <Menu
            sx={{
              mt: '45px',
              '& .MuiPaper-root': {
                backgroundColor: '#0F1A2E',
                color: 'white',
                minWidth: '220px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(16px)',
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
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.95rem' }}>{userProfile?.name || 'User'}</Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>{userProfile?.email}</Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 1.5 }} />
            <MenuItem
              onClick={handleLogout}
              sx={{
                mt: 1,
                mx: 1,
                borderRadius: '12px',
                '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                color: '#EF4444',
              }}
            >
              <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
              <Typography>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default GlobalNavbar;
