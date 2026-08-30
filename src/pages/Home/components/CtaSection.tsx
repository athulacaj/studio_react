import React from 'react';
import { Box, Typography, Button, Container, Chip, Stack } from '@mui/material';
import { ArrowRight, Sparkles, Globe, HardDrive, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth';

const featurePills = [
  {
    icon: <Globe size={15} color="#A855F7" />,
    label: 'Custom Domain Portfolios',
  },
  {
    icon: <HardDrive size={15} color="#38BDF8" />,
    label: 'Google Drive Photo Proofing',
  },
  {
    icon: <Wand2 size={15} color="#EC4899" />,
    label: 'AI-Powered Invitations',
  },
];

const CtaSection: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate(`/private/studio/${currentUser.userId}/studio`);
    } else {
      navigate('/login');
    }
  };

  return (
    <Box
      id="cta-section"
      sx={{
        py: { xs: 10, md: 16 },
        background: 'linear-gradient(180deg, #030912 0%, #060D1A 50%, #030912 100%)',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      {/* Ambient background glows */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '5%',
          width: { xs: '300px', md: '550px' },
          height: { xs: '300px', md: '550px' },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '5%',
          width: { xs: '300px', md: '550px' },
          height: { xs: '300px', md: '550px' },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: { xs: '24px', sm: '28px', md: '32px' },
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.14) 0%, rgba(15, 23, 42, 0.85) 45%, rgba(6, 13, 26, 0.95) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(192, 132, 252, 0.25)',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.7), 0 0 50px rgba(124, 58, 237, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            p: { xs: 4, sm: 5, md: 7, lg: 8 },
            display: 'flex',
            flexDirection: { xs: 'column-reverse', md: 'row' },
            alignItems: 'center',
            gap: { xs: 5, md: 6, lg: 8 },
          }}
        >
          {/* Subtle Grid Accent Pattern */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.04,
              backgroundImage: `radial-gradient(#FFF 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              pointerEvents: 'none',
            }}
          />

          {/* Left Column: Text, Feature Badges & CTA */}
          <Box sx={{ flex: 1, zIndex: 2, textAlign: { xs: 'center', md: 'left' } }}>
            {/* Top pill badge */}
            <Chip
              icon={<Sparkles size={14} style={{ color: '#C084FC' }} />}
              label="ELEVATE YOUR STUDIO"
              sx={{
                mb: 2.5,
                px: 1.5,
                py: 0.5,
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                bgcolor: 'rgba(157, 78, 221, 0.15)',
                color: '#C084FC',
                border: '1px solid rgba(157, 78, 221, 0.35)',
                boxShadow: '0 0 20px rgba(157, 78, 221, 0.2)',
              }}
            />

            {/* Headline */}
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '2.85rem', lg: '3.25rem' },
                fontWeight: 800,
                color: '#FFF',
                mb: 2.5,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Ready to Upgrade Your{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #C084FC 0%, #E879F9 50%, #38BDF8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Studio Experience?
              </Box>
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{
                color: '#94A3B8',
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' },
                lineHeight: 1.65,
                mb: 3.5,
                maxWidth: { md: '520px' },
                mx: { xs: 'auto', md: 0 },
              }}
            >
              Join the new era of wedding photography. Delight your clients with custom domains, effortless
              Google Drive photo proofing, and AI-powered invitations in one seamless platform.
            </Typography>

            {/* Feature Pills */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              flexWrap="wrap"
              gap={1.5}
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{ mb: 4 }}
            >
              {featurePills.map((feat, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.75,
                    py: 0.9,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: 'rgba(157, 78, 221, 0.1)',
                      borderColor: 'rgba(192, 132, 252, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {feat.icon}
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#E2E8F0',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {feat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* CTA Action Area */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'center', md: 'center' }}
              gap={2.5}
              justifyContent={{ xs: 'center', md: 'flex-start' }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                endIcon={
                  <ArrowRight
                    size={18}
                    style={{
                      transition: 'transform 0.25s ease',
                    }}
                    className="cta-arrow"
                  />
                }
                sx={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #9D4EDD 50%, #A855F7 100%)',
                  color: '#FFF',
                  px: { xs: 4, sm: 5 },
                  py: 1.6,
                  fontSize: '1.05rem',
                  borderRadius: 999,
                  fontWeight: 700,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 0 30px rgba(157, 78, 221, 0.45), 0 8px 24px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #9D4EDD 100%)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 0 45px rgba(157, 78, 221, 0.65), 0 12px 30px rgba(0, 0, 0, 0.5)',
                    '& .cta-arrow': {
                      transform: 'translateX(4px)',
                    },
                  },
                }}
              >
                {currentUser ? 'Go to Studio Dashboard' : 'Get Started Now'}
              </Button>

              {/* Trust Badge */}
              {/* <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  color: '#94A3B8',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#22C55E',
                    boxShadow: '0 0 8px #22C55E',
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.82rem' }}>
                  Instant setup • No credit card required
                </Typography>
              </Box> */}
            </Stack>
          </Box>

          {/* Right Column: Cameraman Illustration Showcase */}
          <Box
            sx={{
              flex: { xs: '1', md: '0 0 45%', lg: '0 0 46%' },
              maxWidth: { xs: '100%', sm: '480px', md: '520px', lg: '560px' },
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Ambient Image Backlight Glow */}
            <Box
              sx={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '28px',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.28) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 75%)',
                filter: 'blur(30px)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />

            {/* Illustration Frame */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                borderRadius: { xs: '20px', sm: '24px' },
                overflow: 'hidden',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(157, 78, 221, 0.25)',
                bgcolor: 'rgba(10, 15, 28, 0.6)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.4s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 28px 60px rgba(0, 0, 0, 0.7), 0 0 45px rgba(157, 78, 221, 0.4)',
                  borderColor: 'rgba(192, 132, 252, 0.45)',
                },
              }}
            >
              <Box
                component="img"
                src="/images/illustrations/cameraman.png"
                alt="Photography Studio Ecosystem Illustration"
                loading="lazy"
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />

              {/* Floating Top-Right Mini Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: { xs: 10, sm: 14 },
                  right: { xs: 10, sm: 14 },
                  px: 1.5,
                  py: 0.6,
                  borderRadius: '999px',
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(192, 132, 252, 0.35)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                }}
              >
                <Sparkles size={13} color="#C084FC" />
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#F1F5F9',
                    letterSpacing: '0.02em',
                  }}
                >
                  All-in-One Studio
                </Typography>
              </Box>

              {/* Bottom Subtle Gradient Shadow Overlay for Seamless Depth */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '28px',
                  background: 'linear-gradient(to top, rgba(10, 15, 28, 0.4), transparent)',
                  pointerEvents: 'none',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CtaSection;
