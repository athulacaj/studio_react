import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import { Camera, Image as ImageIcon, Folder, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

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

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowRight />}
              onClick={() => navigate('/private/studio')}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Go to Studio
            </Button>
          </Box>
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
    </Box>
  );
};

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
