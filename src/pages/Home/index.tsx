import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import { Camera, Image as ImageIcon, Folder, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth';
import { getWebsiteTemplatesByType, WebsiteTemplate, WebsiteTemplateType } from '../../features/portfolio-management/api/WebsiteService';
import { AutoAwesome as SparklesIcon } from '@mui/icons-material';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuthStore();
  const [templates, setTemplates] = React.useState<WebsiteTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = React.useState(true);

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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 12, md: 20 },
          pb: { xs: 8, md: 16 },
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #030912 0%, #050E1A 100%)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(157, 78, 221, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '5rem' },
              mb: 3,
              background: 'linear-gradient(to right, #fff, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(157,78,221,0.3)',
            }}
          >
            Mizhiv
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              color: 'text.secondary',
              mb: 6,
              maxWidth: '800px',
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            Luxury wedding memories delivered through modern technology.
          </Typography>


          {/* Templates Section */}
          <Box sx={{ py: { xs: 8, md: 12 }, background: 'rgba(157, 78, 221, 0.02)' }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: 'center', mb: 8 }}>
                <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2, fontWeight: 700, background: 'linear-gradient(to right, #fff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Stunning Templates
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                  Choose from our curated collection of beautiful, responsive templates designed specifically for wedding memories.
                </Typography>
              </Box>

              {loadingTemplates ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <Typography color="text.secondary">Loading templates...</Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 4
                  }}
                >
                  {templates.slice(0, 6).map((template) => {
                    const previewImg = template.desktopScreenshotUrl || template.mobileScreenshotUrl;

                    return (
                      <Box key={template.id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            bgcolor: 'rgba(15, 26, 46, 0.7)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: 4,
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateY(-6px)',
                              borderColor: 'rgba(192, 132, 252, 0.5)',
                              boxShadow: '0 15px 35px rgba(124, 58, 237, 0.25)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              height: 220,
                              bgcolor: '#030912',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {previewImg ? (
                              <Box
                                component="img"
                                src={previewImg}
                                alt={`Template ${template.id}`}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  p: 2,
                                  textAlign: 'center',
                                }}
                              >
                                <SparklesIcon sx={{ color: '#C084FC', fontSize: 32, mb: 1.5 }} />
                                <Typography variant="subtitle2" sx={{ color: '#E2E8F0' }}>
                                  {template.type.replace(/__/g, ' ')}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="h6" sx={{ color: '#FFF', fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
                                {template.type.replace(/__/g, ' ')} Template
                              </Typography>
                            </Box>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={() => window.open(template.url, "_blank")}
                              endIcon={<ArrowRight size={18} />}
                              sx={{
                                mt: 3,
                                borderRadius: 2.5,
                                py: 1.2,
                                fontWeight: 600,
                                borderColor: 'rgba(168, 85, 247, 0.5)',
                                color: '#C084FC',
                                '&:hover': {
                                  borderColor: '#A855F7',
                                  bgcolor: 'rgba(168, 85, 247, 0.1)',
                                  color: '#FFF',
                                },
                              }}
                            >
                              View Demo
                            </Button>
                          </CardContent>
                        </Card>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Container>
          </Box>

          {/* <Box sx={{ mt: 4, display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Card
              sx={{
                width: { xs: '100%', sm: 320 },
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(157, 78, 221, 0.2)',
                  borderColor: 'rgba(157, 78, 221, 0.5)',
                }
              }}
              onClick={() => navigate('/user/login')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>
                  Client
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  You are an individual person and manage your projects.
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                width: { xs: '100%', sm: 320 },
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(157, 78, 221, 0.2)',
                  borderColor: 'rgba(157, 78, 221, 0.5)',
                }
              }}
              onClick={() => navigate(currentUser ? `/private/studio/${currentUser.userId}/studio` : '/login')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>
                  Studio
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  You have a studio and want to manage your projects.
                </Typography>
              </CardContent>
            </Card>
          </Box> */}
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(157, 78, 221, 0.2)',
                  }
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'rgba(157, 78, 221, 0.1)',
                    color: 'primary.main',
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent sx={{ p: 0, flexGrow: 1 }}>
                  <Typography variant="h3" sx={{ mb: 2, fontSize: '1.5rem' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Carousel Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, overflow: 'hidden', position: 'relative' }}>
        <Container maxWidth="xl">
          <Typography variant="h2" sx={{ textAlign: 'center', mb: 6, fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}>
            Discover Our Capabilities
          </Typography>

          <Box sx={{
            '& .swiper': { padding: '20px 0 60px 0' },
            '& .swiper-slide': {
              width: { xs: '280px', sm: '320px', md: '400px' },
              transition: 'all 0.3s ease',
              filter: 'blur(4px)',
              opacity: 0.6,
            },
            '& .swiper-slide-active': {
              transform: 'scale(1.05)',
              zIndex: 10,
              filter: 'blur(0)',
              opacity: 1,
            },
            '& .swiper-pagination-bullet': {
              backgroundColor: 'primary.main',
            },
            '& .swiper-button-next, & .swiper-button-prev': {
              color: 'primary.main',
              '&::after': {
                fontSize: '24px',
                fontWeight: 'bold',
              }
            }
          }}>
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              initialSlide={2}
              coverflowEffect={{
                rotate: 15,
                stretch: 0,
                depth: 200,
                modifier: 1,
                slideShadows: true,
              }}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
            >
              {carouselData.map((item, index) => (
                <SwiperSlide key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                      aspectRatio: '4/5',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <img
                      src={item.image.trim()}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop';
                      }}
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

const carouselData = [
  {
    "title": "Studio Website Builder",
    "image": "./images/carousel/Studio Website Builder.png  "
  },
  {
    "title": "Custom Wedding Invitations",
    "image": "./images/carousel/Custom Wedding Invitations.png"
  },
  {
    "title": "Photo Proofing with Your Google Drive",
    "image": "./images/carousel/Photo Proofing with Your Google Drive.png"
  },
  {
    "title": "Client-Owned Google Drive Photo Proofing",
    "image": "./images/carousel/Client-Owned Google Drive Photo Proofing.png"
  },
  {
    "title": "Live Photo Delivery (Coming Soon)",
    "image": "./images/carousel/Live Photo Delivery (Coming Soon).png"
  },
]

const features = [
  {
    icon: <ImageIcon size={32} />,
    title: 'Cinematic Galleries',
    description: 'Immerse your clients in stunning, full-screen image galleries that showcase your work at its best.'
  },
  {
    icon: <Folder size={32} />,
    title: 'Smart Organization',
    description: 'Easily manage thousands of photos with intuitive album creation and folder structures.'
  },
  {
    icon: <Camera size={32} />,
    title: 'Client Proofing',
    description: 'Streamline the selection process with seamless client favoriting and feedback tools.'
  }
];

export default Home;
