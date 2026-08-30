import React from 'react';
import { Box, Typography, Container, Button, Chip, Stack } from '@mui/material';
import {
  Globe,
  Sparkles,
  Cloud,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ScanFace,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth';

export interface FeatureItem {
  id: string;
  number: string;
  badge: string;
  badgeColor: { bg: string; text: string; border: string; glow: string };
  title: string;
  tagline: string;
  description: string;
  subDescription?: string;
  bullets: Array<{ text: string; highlight?: string }>;
  image: string;
  icon: React.ReactNode;
  isComingSoon?: boolean;
  accentGradient: string;
}

const featuresData: FeatureItem[] = [
  {
    id: 'studio-website-builder',
    number: '01',
    badge: 'Studio Website Builder',
    badgeColor: {
      bg: 'rgba(168, 85, 247, 0.12)',
      text: '#C084FC',
      border: 'rgba(168, 85, 247, 0.3)',
      glow: 'rgba(168, 85, 247, 0.25)',
    },
    title: 'Studio Website Builder',
    tagline: 'Create and manage your studio website with ease.',
    description:
      'Build a professional portfolio website for your wedding or photography studio. Showcase your work, services, galleries, contact details, and more — all in one place.',
    bullets: [
      { text: 'Create and manage your studio website' },
      { text: 'Add your custom domain', highlight: 'custom domain' },
      { text: 'Showcase your photography portfolio' },
      { text: 'Update content whenever you need' },
      { text: 'Give your studio a professional online presence' },
    ],
    image: '/images/carousel/Studio Website Builder.png',
    icon: <Globe size={24} />,
    accentGradient: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
  },
  {
    id: 'custom-wedding-invitations',
    number: '02',
    badge: 'Custom Wedding Invitations',
    badgeColor: {
      bg: 'rgba(236, 72, 153, 0.12)',
      text: '#F472B6',
      border: 'rgba(236, 72, 153, 0.3)',
      glow: 'rgba(236, 72, 153, 0.25)',
    },
    title: 'Custom Wedding Invitations',
    tagline: 'Create beautiful digital wedding invitations with your own domain.',
    description:
      'Choose from ready-made invitation templates or create a completely custom invitation using AI. Share your invitation with guests using a personalized domain.',
    bullets: [
      { text: 'Choose from beautiful invitation templates' },
      { text: 'Create a completely new design with AI', highlight: 'AI' },
      { text: 'Customize names, dates, venues, photos, and content' },
      { text: 'Use your custom domain', highlight: 'custom domain' },
      { text: 'Share your invitation easily with guests' },
      { text: 'Perfect for weddings and special events' },
    ],
    image: '/images/carousel/Custom Wedding Invitations.png',
    icon: <Sparkles size={24} />,
    accentGradient: 'linear-gradient(135deg, #DB2777 0%, #F472B6 100%)',
  },
  {
    id: 'photo-proofing-google-drive',
    number: '03',
    badge: 'Photo Proofing via Google Drive',
    badgeColor: {
      bg: 'rgba(56, 189, 248, 0.12)',
      text: '#38BDF8',
      border: 'rgba(56, 189, 248, 0.3)',
      glow: 'rgba(56, 189, 248, 0.25)',
    },
    title: 'Photo Proofing with Your Google Drive',
    tagline: 'Let clients select their photos without downloading anything.',
    description:
      'Keep your existing workflow with Google Drive. Upload your photos to your Drive, connect the folder to Mizhiv, and let clients browse and select their favorite photos directly from the browser.',
    subDescription: 'Clients can simply like the photos they want, without downloading the entire gallery.',
    bullets: [
      { text: 'Use your existing Google Drive', highlight: 'Google Drive' },
      { text: 'Upload photos directly to your Drive' },
      { text: 'Connect the Drive folder to Mizhiv' },
      { text: 'Clients can browse photos online' },
      { text: 'Clients can like/select their favorite photos', highlight: 'like/select' },
      { text: 'No need for clients to download photos' },
      { text: 'Your original photos remain in your Drive' },
      { text: 'Simple and convenient photo selection workflow' },
    ],
    image: '/images/carousel/Photo Proofing with Your Google Drive.png',
    icon: <Cloud size={24} />,
    accentGradient: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
  },
  {
    id: 'client-owned-google-drive',
    number: '04',
    badge: 'Client-Owned Storage & Privacy',
    badgeColor: {
      bg: 'rgba(52, 211, 153, 0.12)',
      text: '#34D399',
      border: 'rgba(52, 211, 153, 0.3)',
      glow: 'rgba(52, 211, 153, 0.25)',
    },
    title: 'Client-Owned Google Drive Photo Proofing',
    tagline: 'Let your clients keep complete ownership of their photos.',
    description:
      'Connect your client’s Google Drive and allow them to use their own storage for photo proofing. Photos remain in the client’s Drive while Mizhiv provides an easy interface for browsing and selecting them.',
    bullets: [
      { text: "Connect the client's Google Drive", highlight: "client's Google Drive" },
      { text: "Photos stay in the client's own Drive" },
      { text: 'No need to move or duplicate large photo collections' },
      { text: 'Clients can browse photos online' },
      { text: 'Clients can like/select their favorite photos' },
      { text: 'Great for photographers who want clients to own and manage their files' },
    ],
    image: '/images/carousel/Client-Owned Google Drive Photo Proofing.png',
    icon: <ShieldCheck size={24} />,
    accentGradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
  },
  {
    id: 'live-photo-delivery',
    number: '05',
    badge: 'AI Live Event Delivery',
    badgeColor: {
      bg: 'rgba(251, 191, 36, 0.12)',
      text: '#FBBF24',
      border: 'rgba(251, 191, 36, 0.3)',
      glow: 'rgba(251, 191, 36, 0.25)',
    },
    title: 'Live Photo Delivery',
    tagline: 'Deliver wedding photos to guests while the event is happening.',
    description:
      'Guests can take a selfie and Mizhiv will help find their photos from the event, allowing them to quickly discover and view moments they appear in.',
    bullets: [
      { text: 'Guests take a selfie' },
      { text: 'Find photos featuring the guest' },
      { text: 'Deliver photos during or shortly after the event' },
      { text: 'No manual searching through hundreds of photos' },
      { text: 'Designed for weddings and live events' },
    ],
    image: '/images/carousel/Live Photo Delivery (Coming Soon).png',
    icon: <ScanFace size={24} />,
    isComingSoon: true,
    accentGradient: 'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)',
  },
];

const FeaturesSection: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const handleAction = () => {
    if (currentUser) {
      navigate(`/private/studio/${currentUser.userId}/studio`);
    } else {
      navigate('/login');
    }
  };

  const renderHighlightedText = (text: string, highlight?: string) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <Box
              key={index}
              component="span"
              sx={{
                fontWeight: 700,
                color: '#F8FAFC',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(192, 132, 252, 0.4)',
                textUnderlineOffset: '3px',
              }}
            >
              {part}
            </Box>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <Box
      id="features-section"
      sx={{
        position: 'relative',
        py: { xs: 10, md: 16 },
        background: 'linear-gradient(180deg, #030912 0%, #060D1A 50%, #030912 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glows */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '55%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 114, 182, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
          <Chip
            icon={<Sparkles size={14} style={{ color: '#C084FC' }} />}
            label="POWERFUL CAPABILITIES"
            sx={{
              mb: 2.5,
              px: 1.5,
              py: 0.5,
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              bgcolor: 'rgba(157, 78, 221, 0.12)',
              color: '#C084FC',
              border: '1px solid rgba(157, 78, 221, 0.3)',
              boxShadow: '0 0 20px rgba(157, 78, 221, 0.2)',
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' },
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              mb: 3,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Everything Your Studio Needs to Thrive
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.05rem', md: '1.25rem' },
              color: '#94A3B8',
              maxWidth: 780,
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            From custom portfolio websites and interactive AI invitations to seamless Google Drive photo proofing
            and live event delivery — all crafted for modern photographers.
          </Typography>

          {/* Quick Feature Navigation Pill Bar */}
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ mt: 4, gap: 1 }}
          >
            {featuresData.map((f, i) => (
              <Button
                key={f.id}
                onClick={() => {
                  const element = document.getElementById(f.id);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                sx={{
                  py: 0.8,
                  px: 2,
                  fontSize: '0.82rem',
                  borderRadius: 999,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#CBD5E1',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: f.badgeColor.bg,
                    borderColor: f.badgeColor.border,
                    color: '#FFF',
                    boxShadow: `0 0 16px ${f.badgeColor.glow}`,
                  },
                }}
              >
                <Box component="span" sx={{ color: f.badgeColor.text, fontWeight: 700, mr: 0.8 }}>
                  0{i + 1}.
                </Box>
                {f.badge}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Detailed Alternating Features Showcase */}
        <Stack spacing={{ xs: 10, md: 16 }}>
          {featuresData.map((feature, index) => {
            const isEven = index % 2 === 0;

            return (
              <Box
                key={feature.id}
                id={feature.id}
                sx={{
                  position: 'relative',
                  borderRadius: { xs: '16px', md: '20px' },
                  p: { xs: 3, sm: 4, md: 6 },
                  background: 'rgba(15, 26, 46, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: feature.badgeColor.border,
                    boxShadow: `0 25px 60px rgba(0, 0, 0, 0.5), 0 0 35px ${feature.badgeColor.glow}`,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: { xs: 4, md: 6 },
                    alignItems: 'center',
                  }}
                >
                  {/* Text Column */}
                  <Box sx={{ order: { xs: 2, md: isEven ? 1 : 2 } }}>
                    <Box>
                      {/* Header Badge */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={`0${index + 1} • ${feature.badge.toUpperCase()}`}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            letterSpacing: '0.05em',
                            bgcolor: feature.badgeColor.bg,
                            color: feature.badgeColor.text,
                            border: `1px solid ${feature.badgeColor.border}`,
                          }}
                        />

                        {feature.isComingSoon && (
                          <Chip
                            label="COMING SOON"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              letterSpacing: '0.08em',
                              background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
                              color: '#000',
                              boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
                              animation: 'glowPulse 2.5s infinite',
                            }}
                          />
                        )}
                      </Box>

                      {/* Main Title */}
                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: { xs: '1.75rem', sm: '2.2rem', md: '2.6rem' },
                          fontWeight: 700,
                          color: '#FFFFFF',
                          mb: 1.5,
                          lineHeight: 1.2,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {feature.title}
                      </Typography>

                      {/* Tagline / Subtitle */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: '1.05rem', md: '1.2rem' },
                          fontWeight: 600,
                          color: feature.badgeColor.text,
                          mb: 2.5,
                          lineHeight: 1.4,
                        }}
                      >
                        {feature.tagline}
                      </Typography>

                      {/* Main Description */}
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#94A3B8',
                          fontSize: { xs: '0.95rem', md: '1.05rem' },
                          lineHeight: 1.7,
                          mb: feature.subDescription ? 2 : 3,
                        }}
                      >
                        {feature.description}
                      </Typography>

                      {/* Sub-description if present */}
                      {feature.subDescription && (
                        <Box
                          sx={{
                            p: 2,
                            mb: 3,
                            borderRadius: 3,
                            bgcolor: 'rgba(56, 189, 248, 0.06)',
                            borderLeft: '4px solid #38BDF8',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#E2E8F0',
                              fontWeight: 500,
                              fontSize: '0.95rem',
                              lineHeight: 1.6,
                            }}
                          >
                            {feature.subDescription}
                          </Typography>
                        </Box>
                      )}

                      {/* Feature Bullet Points */}
                      <Box sx={{ mb: 4 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: '#CBD5E1',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            fontSize: '0.78rem',
                            mb: 2,
                          }}
                        >
                          Key Highlights
                        </Typography>

                        <Stack spacing={1.5}>
                          {feature.bullets.map((bullet, bIndex) => (
                            <Box
                              key={bIndex}
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  mt: 0.3,
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: feature.badgeColor.bg,
                                  border: `1px solid ${feature.badgeColor.border}`,
                                  flexShrink: 0,
                                }}
                              >
                                <CheckCircle2 size={13} style={{ color: feature.badgeColor.text }} />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#94A3B8',
                                  fontSize: { xs: '0.9rem', md: '0.95rem' },
                                  lineHeight: 1.55,
                                }}
                              >
                                {renderHighlightedText(bullet.text, bullet.highlight)}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                      {/* Action Button */}
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          onClick={handleAction}
                          endIcon={<ArrowRight size={18} />}
                          sx={{
                            background: feature.accentGradient,
                            px: 3.5,
                            py: 1.2,
                            borderRadius: 3,
                            fontWeight: 600,
                            fontSize: '0.92rem',
                            boxShadow: `0 0 20px ${feature.badgeColor.glow}`,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 0 30px ${feature.badgeColor.glow}`,
                            },
                          }}
                        >
                          {feature.isComingSoon ? 'Join Waitlist' : 'Get Started'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {/* Image / Mockup Column */}
                  <Box sx={{ order: { xs: 1, md: isEven ? 2 : 1 } }}>
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        bgcolor: '#030912',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        transition: 'all 0.4s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          borderColor: feature.badgeColor.border,
                        },
                      }}
                    >
                      {/* Top Window Chrome / Bar */}
                      <Box
                        sx={{
                          height: 36,
                          bgcolor: 'rgba(15, 26, 46, 0.95)',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                          px: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {/* Traffic light dots */}
                        <Box sx={{ display: 'flex', gap: 0.8 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444', opacity: 0.8 }} />
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B', opacity: 0.8 }} />
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981', opacity: 0.8 }} />
                        </Box>

                        {/* Title pill */}
                        <Box
                          sx={{
                            px: 2,
                            py: 0.3,
                            borderRadius: '999px',
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            fontSize: '0.72rem',
                            color: '#94A3B8',
                            fontWeight: 500,
                          }}
                        >
                          mizhiv.com • {feature.title}
                        </Box>

                        <Box sx={{ width: 40 }} />
                      </Box>

                      {/* Feature Image Artwork */}
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '4/5',
                          overflow: 'hidden',
                          bgcolor: '#050E1A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          component="img"
                          src={feature.image}
                          alt={feature.title}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.5s ease',
                            '&:hover': {
                              transform: 'scale(1.04)',
                            },
                          }}
                        />

                        {/* Floating Feature Tag in image */}
                        {/* <Box
                          sx={{
                            position: 'absolute',
                            bottom: 16,
                            left: 16,
                            right: 16,
                            p: 2,
                            borderRadius: '10px',
                            background: 'rgba(3, 9, 18, 0.85)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: '8px',
                              bgcolor: feature.badgeColor.bg,
                              color: feature.badgeColor.text,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              noWrap
                              sx={{ color: '#FFF', fontWeight: 600, fontSize: '0.85rem' }}
                            >
                              {feature.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}
                            >
                              {feature.tagline}
                            </Typography>
                          </Box>
                        </Box> */}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
