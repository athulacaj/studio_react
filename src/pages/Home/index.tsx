import React from 'react';
import { Box, Typography, Button, Container, Chip, Stack, IconButton } from '@mui/material';
import { ArrowRight, Sparkles, Globe, ShieldCheck, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth';
import { getWebsiteTemplatesByType, WebsiteTemplate, WebsiteTemplateType } from '../../features/portfolio-management/api/WebsiteService';
import FeaturesSection from './components/FeaturesSection';
import InteractiveTemplatesSection from './components/InteractiveTemplatesSection';
import ContactSection from './components/ContactSection';
import CtaSection from './components/CtaSection';

// Swiper imports
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const carouselData = [
  {
    title: 'Studio Website Builder',
    image: '/images/carousel/Studio Website Builder.png',
    tag: 'Portfolio & Branding',
  },
  {
    title: 'Custom Wedding Invitations',
    image: '/images/carousel/Custom Wedding Invitations.png',
    tag: 'AI Invitations',
  },
  {
    title: 'Photo Proofing with Your Google Drive',
    image: '/images/carousel/Photo Proofing with Your Google Drive.png',
    tag: 'Zero Client Downloads',
  },
  {
    title: 'Client-Owned Google Drive Photo Proofing',
    image: '/images/carousel/Client-Owned Google Drive Photo Proofing.png',
    tag: 'Client Storage & Privacy',
  },
  {
    title: 'Live Photo Delivery (Coming Soon)',
    image: '/images/carousel/Live Photo Delivery (Coming Soon).png',
    tag: 'AI Face Search',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [templates, setTemplates] = React.useState<WebsiteTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = React.useState(true);
  const [swiperInstance, setSwiperInstance] = React.useState<SwiperClass | null>(null);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getWebsiteTemplatesByType(WebsiteTemplateType.weddingInvitation);
        setTemplates(data || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleGetStarted = () => {
    if (currentUser) {
      navigate(`/private/studio/${currentUser.userId}/studio`);
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#030912' }}>
      {/* 1. HERO SECTION */}
      <Box
        id="hero-section"
        sx={{
          position: 'relative',
          pt: { xs: 14, md: 20 },
          pb: { xs: 12, md: 18 },
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #030912 0%, #060D1A 60%, #030912 100%)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: '350px', md: '750px' },
            height: { xs: '350px', md: '750px' },
            background: 'radial-gradient(circle, rgba(157, 78, 221, 0.22) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Top subtle announcement pill */}
          <Chip
            icon={<Sparkles size={14} style={{ color: '#C084FC' }} />}
            label="THE ALL-IN-ONE PHOTOGRAPHY & WEDDING SUITE"
            sx={{
              mb: 3.5,
              px: 2,
              py: 0.6,
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              bgcolor: 'rgba(157, 78, 221, 0.12)',
              color: '#C084FC',
              border: '1px solid rgba(157, 78, 221, 0.3)',
              boxShadow: '0 0 24px rgba(157, 78, 221, 0.25)',
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3.2rem', sm: '4.5rem', md: '5.8rem' },
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
              mb: 3,
              background: 'linear-gradient(135deg, #FFFFFF 20%, #E2E8F0 60%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(157,78,221,0.3)',
            }}
          >
            Mizhiv
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.6rem', md: '2.1rem' },
              color: '#E2E8F0',
              mb: 3,
              maxWidth: '860px',
              mx: 'auto',
              fontWeight: 500,
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
            }}
          >
            Luxury wedding memories delivered through modern technology.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.95rem', md: '1.15rem' },
              color: '#94A3B8',
              mb: 5,
              maxWidth: '720px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Empower your studio with custom websites, AI-powered wedding invitations, frictionless Google Drive photo
            proofing with zero downloads, and real-time event photo delivery.
          </Typography>

          {/* CTA Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 6 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              endIcon={<ArrowRight size={18} />}
              sx={{
                background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                color: '#FFF',
                px: 4,
                py: 1.5,
                fontSize: '1.05rem',
                borderRadius: 999,
                boxShadow: '0 0 30px rgba(157, 78, 221, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #6D28D9 0%, #9D4EDD 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 40px rgba(157, 78, 221, 0.6)',
                },
              }}
            >
              {currentUser ? 'Open Studio Dashboard' : 'Get Started Now'}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => scrollToSection('features-section')}
              sx={{
                color: '#E2E8F0',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                px: 3.5,
                py: 1.5,
                fontSize: '1.05rem',
                borderRadius: 999,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: '#C084FC',
                  bgcolor: 'rgba(157, 78, 221, 0.1)',
                  color: '#FFF',
                },
              }}
            >
              Explore All Features
            </Button>
          </Stack>

          {/* Quick highlight feature badges */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: { xs: 2, md: 4 },
              pt: 4,
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              maxWidth: 950,
              mx: 'auto',
            }}
          >
            {[
              { icon: <Globe size={18} color="#C084FC" />, label: 'Custom Domain Studio Websites' },
              { icon: <Sparkles size={18} color="#F472B6" />, label: 'AI Wedding Invitations' },
              { icon: <ShieldCheck size={18} color="#38BDF8" />, label: 'Google Drive Photo Proofing' },
              { icon: <HeartHandshake size={18} color="#34D399" />, label: 'Client-Owned Storage' },
            ].map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.icon}
                <Typography variant="body2" sx={{ color: '#CBD5E1', fontWeight: 500, fontSize: '0.85rem' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 2. CAPABILITIES CAROUSEL SECTION (COVERFLOW) */}
      <Box
        id="capabilities-section"
        sx={{
          py: { xs: 8, md: 12 },
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(180deg, #030912 0%, #081120 50%, #030912 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Chip
              label="VISUAL SHOWCASE"
              sx={{
                mb: 2,
                px: 1.5,
                fontWeight: 700,
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                bgcolor: 'rgba(168, 85, 247, 0.1)',
                color: '#C084FC',
                border: '1px solid rgba(168, 85, 247, 0.25)',
              }}
            />
            <Typography
              variant="h2"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3rem' },
                background: 'linear-gradient(to right, #FFF, #C084FC)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1.5,
              }}
            >
              Discover Our Capabilities
            </Typography>
            <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 600, mx: 'auto' }}>
              Swipe through our core modules designed to simplify workflows and impress your clients.
            </Typography>
          </Box>

          <Box
            sx={{
              position: 'relative',
              px: { xs: 0, md: 6 },
              '& .swiper': { padding: '20px 0 60px 0' },
              '& .swiper-slide': {
                width: { xs: '280px', sm: '340px', md: '420px' },
                transition: 'all 0.35s ease',
                filter: 'blur(3px)',
                opacity: 0.55,
              },
              '& .swiper-slide-active': {
                transform: 'scale(1.06)',
                zIndex: 10,
                filter: 'blur(0)',
                opacity: 1,
              },
              '& .swiper-pagination-bullet': {
                backgroundColor: '#9D4EDD',
                opacity: 0.5,
              },
              '& .swiper-pagination-bullet-active': {
                backgroundColor: '#C084FC',
                opacity: 1,
                width: '24px',
                borderRadius: '6px',
              },
            }}
          >
            {/* Custom Left Arrow Button - Hidden on mobile */}
            <IconButton
              aria-label="Previous capability"
              onClick={() => swiperInstance?.slidePrev()}
              sx={{
                display: { xs: 'none', md: 'flex' },
                position: 'absolute',
                left: { md: 0, lg: 8 },
                top: '46%',
                transform: 'translateY(-50%)',
                zIndex: 20,
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'rgba(15, 26, 46, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                color: '#C084FC',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(157, 78, 221, 0.2)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'rgba(157, 78, 221, 0.25)',
                  borderColor: '#C084FC',
                  color: '#FFFFFF',
                  boxShadow: '0 0 25px rgba(157, 78, 221, 0.5)',
                  transform: 'translateY(-50%) scale(1.08)',
                },
              }}
            >
              <ChevronLeft size={24} />
            </IconButton>

            {/* Custom Right Arrow Button - Hidden on mobile */}
            <IconButton
              aria-label="Next capability"
              onClick={() => swiperInstance?.slideNext()}
              sx={{
                display: { xs: 'none', md: 'flex' },
                position: 'absolute',
                right: { md: 0, lg: 8 },
                top: '46%',
                transform: 'translateY(-50%)',
                zIndex: 20,
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'rgba(15, 26, 46, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                color: '#C084FC',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(157, 78, 221, 0.2)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'rgba(157, 78, 221, 0.25)',
                  borderColor: '#C084FC',
                  color: '#FFFFFF',
                  boxShadow: '0 0 25px rgba(157, 78, 221, 0.5)',
                  transform: 'translateY(-50%) scale(1.08)',
                },
              }}
            >
              <ChevronRight size={24} />
            </IconButton>

            <Swiper
              onSwiper={setSwiperInstance}
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              initialSlide={0}
              coverflowEffect={{
                rotate: 12,
                stretch: 0,
                depth: 180,
                modifier: 1,
                slideShadows: true,
              }}
              pagination={{ clickable: true }}
              modules={[EffectCoverflow, Pagination, Autoplay]}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              loop={true}
            >
              {carouselData.map((item, index) => (
                <SwiperSlide key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
                      aspectRatio: '4/5',
                      bgcolor: '#0F1A2E',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'border-color 0.3s ease',
                      '&:hover': {
                        borderColor: 'rgba(192, 132, 252, 0.5)',
                      },
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop';
                      }}
                    />

                    {/* Floating Slide Tag */}
                    {/* <Box
                      sx={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 999,
                        bgcolor: 'rgba(3, 9, 18, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#C084FC', fontWeight: 700 }}>
                        {item.tag}
                      </Typography>
                    </Box> */}
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Container>
      </Box>

      {/* 3. COMPREHENSIVE FEATURES DEEP-DIVE (ALL 5 FEATURES) */}
      <FeaturesSection />

      {/* 4. INTERACTIVE TEMPLATES SECTION WITH SMARTPHONE PREVIEW & DROPDOWN */}
      <InteractiveTemplatesSection templates={templates} loading={loadingTemplates} />

      {/* 5. CONTACT SECTION (EMAIL & INSTAGRAM) */}
      <ContactSection />

      {/* 6. BOTTOM CALL TO ACTION BANNER */}
      <CtaSection />
    </Box>

  );
};

export default Home;
