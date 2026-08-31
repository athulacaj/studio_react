import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  Sparkles,
  Layers,
  Smartphone,
  Mail,
  Menu as MenuIcon,
  X as CloseIcon,
  ArrowRight,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';

interface NavSectionItem {
  name: string;
  target: string; // hash or path
  isHash: boolean;
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

const navItems: NavSectionItem[] = [
  {
    name: 'Home',
    target: 'hero-section',
    isHash: true,
    icon: <HomeIcon size={18} />,
    description: 'Welcome to Mizhiv photography suite',
  },
  {
    name: 'Capabilities',
    target: 'capabilities-section',
    isHash: true,
    icon: <Layers size={18} />,
    description: '3D interactive capabilities showcase',
  },
  {
    name: 'Features',
    target: 'features-section',
    isHash: true,
    icon: <Sparkles size={18} />,
    description: 'Websites, invitations, & Google Drive proofing',
  },
  {
    name: 'Templates',
    target: 'templates-section',
    isHash: true,
    icon: <Smartphone size={18} />,
    description: 'Live smartphone wedding invitation viewer',
  },
  {
    name: 'Contact',
    target: 'contact-section',
    isHash: true,
    icon: <Mail size={18} />,
    description: 'Email & official Instagram channels',
  },
];

export const GlobalNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // Track scroll state for blur & shadow adjustment
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll Spy: dynamically determine which section is currently active
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sectionIds = [
      'hero-section',
      'capabilities-section',
      'features-section',
      'templates-section',
      'contact-section',
      'cta-section',
    ];

    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 180; // offset for navbar height + breathing room

      // Near top of page
      if (window.scrollY < 250) {
        setActiveSection('hero-section');
        return;
      }

      // Check if user scrolled near the very bottom
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
        setActiveSection('contact-section');
        return;
      }

      // Check from bottom section upwards
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            // Map cta to contact-section
            if (id === 'cta-section') {
              setActiveSection('contact-section');
            } else {
              setActiveSection(id);
            }
            break;
          }
        }
      }
    };

    handleScrollSpy();
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [location.pathname]);

  // Handle hash scrolling on external navigation (e.g. from subpages to /#features-section)
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const sectionId = location.hash.replace('#', '');
      const element = document.getElementById(sectionId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(sectionId);
        }, 120);
      }
    }
  }, [location]);

  const handleNavClick = (item: NavSectionItem) => {
    setMobileDrawerOpen(false);

    if (item.isHash) {
      if (location.pathname === '/') {
        if (item.target === 'hero-section') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setActiveSection('hero-section');
        } else {
          const element = document.getElementById(item.target);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(item.target);
          }
        }
      } else {
        navigate(`/#${item.target}`);
      }
    } else {
      navigate(item.target);
      setActiveSection(item.target);
    }
  };

  const handleLogoClick = () => {
    setMobileDrawerOpen(false);
    setActiveSection('hero-section');
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const isItemActive = (item: NavSectionItem) => {
    if (item.isHash) {
      if (item.target === 'hero-section') {
        return location.pathname === '/' && (activeSection === 'hero-section' || activeSection === '');
      }
      return location.pathname === '/' && activeSection === item.target;
    }
    return location.pathname === item.target;
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleGoToDashboard = () => {
    handleCloseUserMenu();
    setMobileDrawerOpen(false);
    if (currentUser) {
      navigate(`/private/studio/${currentUser.userId}/studio`);
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    setMobileDrawerOpen(false);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          background: scrolled
            ? 'rgba(3, 9, 18, 0.92)'
            : 'rgba(3, 9, 18, 0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: scrolled
            ? '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(157, 78, 221, 0.08)'
            : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <Toolbar
          sx={{
            height: { xs: 68, md: 74 },
            px: { xs: 2, sm: 3, md: 5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1440px',
            width: '100%',
            mx: 'auto',
          }}
        >
          {/* 1. BRAND LOGO */}
          <Box
            onClick={handleLogoClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              textDecoration: 'none',
              userSelect: 'none',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <Box
              sx={{
                width: { xs: 34, md: 38 },
                height: { xs: 34, md: 38 },
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                boxShadow: '0 0 15px rgba(157, 78, 221, 0.25)',
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src="/images/logo_small.png"
                alt="mizhiv logo"
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/share/images/logo_small.png';
                }}
              />
            </Box>

            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.2rem', md: '1.35rem' },
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #C084FC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              mizhiv
            </Typography>
          </Box>

          {/* 2. DESKTOP NAVIGATION LINKS WITH ACTIVE SECTION INDICATOR */}
          <Box
            sx={{
              display: location.pathname === '/' ? { xs: 'none', md: 'flex' } : 'none',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              p: 0.6,
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            {navItems.map((item) => {
              const active = isItemActive(item);

              return (
                <Button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  startIcon={
                    <Box
                      sx={{
                        color: active ? '#C084FC' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.25s ease',
                      }}
                    >
                      {item.icon}
                    </Box>
                  }
                  sx={{
                    px: 2.2,
                    py: 0.8,
                    borderRadius: '999px',
                    color: active ? '#FFFFFF' : '#94A3B8',
                    fontSize: '0.86rem',
                    fontWeight: active ? 700 : 500,
                    textTransform: 'none',
                    background: active
                      ? 'linear-gradient(135deg, rgba(157, 78, 221, 0.25) 0%, rgba(124, 58, 237, 0.15) 100%)'
                      : 'transparent',
                    border: active
                      ? '1px solid rgba(192, 132, 252, 0.45)'
                      : '1px solid transparent',
                    boxShadow: active
                      ? '0 0 18px rgba(157, 78, 221, 0.35), inset 0 0 8px rgba(192, 132, 252, 0.15)'
                      : 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: active
                        ? 'rgba(157, 78, 221, 0.3)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: '#FFF',
                      boxShadow: '0 0 16px rgba(157, 78, 221, 0.25)',
                    },
                  }}
                >
                  {item.name}

                  {/* Active glowing indicator dot */}
                  {active && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#C084FC',
                        boxShadow: '0 0 8px #C084FC, 0 0 14px #A855F7',
                        ml: 1,
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {item.badge && !active && (
                    <Box
                      component="span"
                      sx={{
                        ml: 1,
                        px: 0.8,
                        py: 0.15,
                        borderRadius: '999px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: 'rgba(236, 72, 153, 0.2)',
                        color: '#F472B6',
                        border: '1px solid rgba(236, 72, 153, 0.4)',
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </Button>
              );
            })}
          </Box>

          {/* 3. DESKTOP ACTION BUTTONS & USER PROFILE */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.8 }}>
            {currentUser ? (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleGoToDashboard}
                  startIcon={<LayoutDashboard size={16} />}
                  sx={{
                    px: 2,
                    py: 0.8,
                    borderRadius: '10px',
                    color: '#C084FC',
                    borderColor: 'rgba(192, 132, 252, 0.4)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    bgcolor: 'rgba(157, 78, 221, 0.08)',
                    '&:hover': {
                      bgcolor: 'rgba(157, 78, 221, 0.18)',
                      borderColor: '#C084FC',
                      boxShadow: '0 0 18px rgba(157, 78, 221, 0.3)',
                    },
                  }}
                >
                  Studio Dashboard
                </Button>

                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{
                    p: 0.4,
                    border: '2px solid rgba(192, 132, 252, 0.3)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: '#C084FC',
                      boxShadow: '0 0 15px rgba(157, 78, 221, 0.4)',
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
                      color: '#FFF',
                    }}
                  >
                    {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#CBD5E1',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    px: 2,
                    textTransform: 'none',
                    '&:hover': {
                      color: '#FFF',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Sign In
                </Button>

                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  endIcon={<ArrowRight size={16} />}
                  sx={{
                    px: 2.5,
                    py: 0.9,
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    textTransform: 'none',
                    background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                    boxShadow: '0 0 20px rgba(157, 78, 221, 0.35)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 0 28px rgba(157, 78, 221, 0.55)',
                    },
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </Box>

          {/* 4. MOBILE HAMBURGER MENU BUTTON */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            {currentUser && (
              <IconButton onClick={handleOpenUserMenu} size="small" sx={{ p: 0.3 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                  }}
                >
                  {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            )}

            <IconButton
              aria-label="open navigation menu"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{
                p: 1,
                borderRadius: '10px',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#C084FC',
                '&:hover': {
                  bgcolor: 'rgba(157, 78, 221, 0.15)',
                },
              }}
            >
              <MenuIcon size={22} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* USER PROFILE DROPDOWN MENU (DESKTOP & MOBILE) */}
      <Menu
        id="user-menu"
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          mt: 1.5,
          '& .MuiPaper-root': {
            bgcolor: '#0F1A2E',
            color: '#FFF',
            minWidth: 230,
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(157, 78, 221, 0.2)',
            p: 1,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
            {currentUser?.name || 'Studio User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
            {currentUser?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 0.8 }} />

        <MenuItem
          onClick={handleGoToDashboard}
          sx={{
            borderRadius: '10px',
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontSize: '0.88rem',
            '&:hover': { bgcolor: 'rgba(157, 78, 221, 0.15)', color: '#C084FC' },
          }}
        >
          <LayoutDashboard size={16} />
          Studio Dashboard
        </MenuItem>

        <MenuItem
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontSize: '0.88rem',
            color: '#EF4444',
            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.12)' },
          }}
        >
          <LogOut size={16} />
          Sign Out
        </MenuItem>
      </Menu>

      {/* MOBILE FULL DRAWER NAVIGATION */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 3,
          '& .MuiDrawer-paper': {
            width: '100%',
            maxWidth: '360px',
            bgcolor: '#060D1A',
            backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(157, 78, 221, 0.15) 0%, transparent 60%)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box>
          {/* Drawer Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pb: 3,
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: 'rgba(157, 78, 221, 0.2)',
                  border: '1px solid rgba(192, 132, 252, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src="/images/logo_small.png"
                  alt="mizhiv logo"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/share/images/logo_small.png';
                  }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #FFF 0%, #C084FC 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                mizhiv
              </Typography>
            </Box>

            <IconButton
              onClick={() => setMobileDrawerOpen(false)}
              sx={{
                p: 0.8,
                borderRadius: '8px',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                color: '#94A3B8',
                '&:hover': { color: '#FFF', bgcolor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              <CloseIcon size={20} />
            </IconButton>
          </Box>

          {/* Navigation Section Items */}
          {location.pathname === '/' && (
            <>
              <Typography
                variant="caption"
            sx={{
              color: '#64748B',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              mb: 1.5,
              display: 'block',
              px: 1,
            }}
          >
            Sections & Pages
          </Typography>

          <Stack spacing={1.2}>
            {navItems.map((item) => {
              const active = isItemActive(item);

              return (
                <Box
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  sx={{
                    p: 1.8,
                    borderRadius: '14px',
                    bgcolor: active
                      ? 'linear-gradient(135deg, rgba(157, 78, 221, 0.25) 0%, rgba(124, 58, 237, 0.12) 100%)'
                      : 'rgba(15, 26, 46, 0.6)',
                    background: active
                      ? 'linear-gradient(135deg, rgba(157, 78, 221, 0.25) 0%, rgba(124, 58, 237, 0.12) 100%)'
                      : 'rgba(15, 26, 46, 0.6)',
                    border: active
                      ? '1.5px solid #C084FC'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    boxShadow: active
                      ? '0 0 25px rgba(157, 78, 221, 0.35)'
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: 'rgba(157, 78, 221, 0.15)',
                      borderColor: 'rgba(192, 132, 252, 0.4)',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: active
                        ? 'rgba(192, 132, 252, 0.3)'
                        : 'rgba(157, 78, 221, 0.15)',
                      color: active ? '#FFF' : '#C084FC',
                      border: `1px solid ${active ? '#C084FC' : 'rgba(157, 78, 221, 0.25)'}`,
                      boxShadow: active ? '0 0 12px rgba(192, 132, 252, 0.5)' : 'none',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: active ? '#FFF' : '#E2E8F0',
                          fontWeight: active ? 700 : 600,
                          fontSize: '0.92rem',
                        }}
                      >
                        {item.name}
                      </Typography>

                      {active && (
                        <Chip
                          label="ACTIVE"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            bgcolor: '#9D4EDD',
                            color: '#FFF',
                            boxShadow: '0 0 10px rgba(157, 78, 221, 0.6)',
                          }}
                        />
                      )}

                      {item.badge && !active && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            bgcolor: 'rgba(236, 72, 153, 0.2)',
                            color: '#F472B6',
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}
                    >
                      {item.description}
                    </Typography>
                  </Box>

                  <ChevronRight size={16} style={{ color: active ? '#C084FC' : '#64748B' }} />
                </Box>
              );
            })}
          </Stack>
            </>
          )}
        </Box>

        {/* Drawer Bottom Actions */}
        <Box sx={{ pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.08)', mt: 3 }}>
          {currentUser ? (
            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleGoToDashboard}
                startIcon={<LayoutDashboard size={18} />}
                sx={{
                  py: 1.3,
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                  boxShadow: '0 0 20px rgba(157, 78, 221, 0.3)',
                }}
              >
                Go to Studio Dashboard
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleLogout}
                startIcon={<LogOut size={18} />}
                sx={{
                  py: 1.1,
                  borderRadius: '12px',
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  color: '#EF4444',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#EF4444',
                  },
                }}
              >
                Sign Out
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate('/login');
                }}
                endIcon={<ArrowRight size={18} />}
                sx={{
                  py: 1.3,
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textTransform: 'none',
                  background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                  boxShadow: '0 0 20px rgba(157, 78, 221, 0.35)',
                }}
              >
                Get Started Free
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate('/login');
                }}
                sx={{
                  py: 1.1,
                  borderRadius: '12px',
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  color: '#CBD5E1',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Sign In
              </Button>
            </Stack>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem' }}>
              © {new Date().getFullYear()} Mizhiv — All-in-One Studio Platform
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default GlobalNavbar;
