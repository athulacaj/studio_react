import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Mail,
  Instagram,
  Copy,
  Check,
  ExternalLink,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const emailAddress = 'studio.mizhiv@gmail.com';
  const instagramUrl = 'https://www.instagram.com/mizhiv_app';
  const instagramHandle = '@mizhiv_app';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setSnackbarOpen(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Box
      id="contact-section"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        background: 'linear-gradient(180deg, #030912 0%, #060D1A 50%, #030912 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Background glowing ambiance */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(157, 78, 221, 0.12) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 7, md: 10 } }}>
          <Chip
            icon={<MessageSquare size={14} style={{ color: '#C084FC' }} />}
            label="GET IN TOUCH"
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
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.6rem' },
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              mb: 2.5,
              background: 'linear-gradient(135deg, #FFFFFF 20%, #E2E8F0 60%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            We'd Love to Hear From You
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#94A3B8',
              maxWidth: 680,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.65,
            }}
          >
            Whether you need custom studio onboarding, help with domain setup, or want to explore new AI wedding
            invitations, we're always here to help.
          </Typography>
        </Box>

        {/* 2-COLUMN CONTACT CARDS */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: { xs: 4, md: 5 },
            mb: 6,
          }}
        >
          {/* 1. EMAIL CARD */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: '20px',
              p: { xs: 3.5, sm: 4.5 },
              bgcolor: 'rgba(15, 26, 46, 0.65)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: 'rgba(192, 132, 252, 0.5)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 35px rgba(157, 78, 221, 0.25)',
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Box>
              {/* Icon & Title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)',
                    border: '1px solid rgba(192, 132, 252, 0.4)',
                    color: '#C084FC',
                    boxShadow: '0 0 20px rgba(157, 78, 221, 0.3)',
                  }}
                >
                  <Mail size={24} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFF', fontSize: '1.35rem' }}>
                    Email Support
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                    Official Studio Help & Inquiries
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" sx={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6, mb: 3 }}>
                Send us a note directly for feature requests, custom domain configurations, or general support.
              </Typography>

              {/* Email Address Pill with Copy button */}
              <Box
                sx={{
                  p: 1.5,
                  px: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(3, 9, 18, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3.5,
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: '#F8FAFC',
                    fontWeight: 600,
                    fontSize: { xs: '0.88rem', sm: '0.95rem' },
                    letterSpacing: '0.01em',
                    wordBreak: 'break-all',
                  }}
                >
                  {emailAddress}
                </Typography>

                <Tooltip title={copied ? 'Copied!' : 'Copy Email'}>
                  <IconButton
                    onClick={handleCopyEmail}
                    size="small"
                    sx={{
                      bgcolor: copied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: copied ? '#22C55E' : '#C084FC',
                      border: '1px solid',
                      borderColor: copied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(157, 78, 221, 0.2)',
                        color: '#FFF',
                      },
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Action Button */}
            <Button
              component="a"
              href={`mailto:${emailAddress}`}
              variant="contained"
              endIcon={<Send size={16} />}
              sx={{
                py: 1.2,
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.92rem',
                textTransform: 'none',
                background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                boxShadow: '0 0 20px rgba(157, 78, 221, 0.35)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 30px rgba(157, 78, 221, 0.55)',
                },
              }}
            >
              Compose Email
            </Button>
          </Box>

          {/* 2. INSTAGRAM CARD */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: '20px',
              p: { xs: 3.5, sm: 4.5 },
              bgcolor: 'rgba(15, 26, 46, 0.65)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: 'rgba(244, 114, 182, 0.5)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 35px rgba(236, 72, 153, 0.25)',
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Box>
              {/* Icon & Title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(244, 114, 182, 0.15) 100%)',
                    border: '1px solid rgba(244, 114, 182, 0.4)',
                    color: '#F472B6',
                    boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
                  }}
                >
                  <Instagram size={24} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFF', fontSize: '1.35rem' }}>
                    Instagram Community
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                    Updates, Stories & Feature Spotlights
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" sx={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6, mb: 3 }}>
                Follow our official page for live previews of new wedding invitation templates, design ideas, and studio tips.
              </Typography>

              {/* Instagram Handle Pill */}
              <Box
                sx={{
                  p: 1.5,
                  px: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(3, 9, 18, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3.5,
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: '#F8FAFC',
                    fontWeight: 600,
                    fontSize: { xs: '0.88rem', sm: '0.95rem' },
                    letterSpacing: '0.01em',
                  }}
                >
                  {instagramHandle}
                </Typography>

                <Chip
                  label="Official"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(236, 72, 153, 0.2)',
                    color: '#F472B6',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                  }}
                />
              </Box>
            </Box>

            {/* Action Button */}
            <Button
              component="a"
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              endIcon={<ExternalLink size={16} />}
              sx={{
                py: 1.2,
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.92rem',
                textTransform: 'none',
                background: 'linear-gradient(90deg, #DB2777 0%, #F472B6 100%)',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.35)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 30px rgba(236, 72, 153, 0.55)',
                },
              }}
            >
              Visit Instagram
            </Button>
          </Box>
        </Box>

        {/* Quick Response Notice */}
        <Box
          sx={{
            p: 2.5,
            px: 3,
            borderRadius: '16px',
            bgcolor: 'rgba(157, 78, 221, 0.08)',
            border: '1px solid rgba(157, 78, 221, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            textAlign: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Sparkles size={18} color="#C084FC" />
          <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 500, fontSize: '0.9rem' }}>
            Fast Studio Support: We typically respond to emails and inquiries within a few hours.
          </Typography>
        </Box>
      </Container>

      {/* Copy Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            bgcolor: '#0F1A2E',
            color: '#FFF',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          }}
        >
          Email address copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactSection;
