import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Sparkles,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { WebsiteTemplate } from '../../../features/portfolio-management/api/WebsiteService';

interface InteractiveTemplatesSectionProps {
  templates: WebsiteTemplate[];
  loading: boolean;
}

export const InteractiveTemplatesSection: React.FC<InteractiveTemplatesSectionProps> = ({
  templates,
  loading,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);

  // Auto-dismiss loading spinner after max 2.5s to prevent stuck overlay on cross-origin templates
  useEffect(() => {
    setIframeLoading(true);
    const timer = setTimeout(() => {
      setIframeLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [selectedTemplateId, iframeKey]);

  // Default to first template when loaded
  useEffect(() => {
    if (templates.length > 0 && selectedTemplateId === null) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleSelectTemplate = (id: number) => {
    if (id !== selectedTemplateId) {
      setSelectedTemplateId(id);
      setIframeLoading(true);
      setIframeKey((prev) => prev + 1);
    }
  };

  const handleReloadIframe = () => {
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <Box
      id="templates-section"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        background: 'linear-gradient(180deg, #030912 0%, #070F1E 50%, #030912 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient lighting */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(157, 78, 221, 0.12) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
          <Chip
            icon={<Sparkles size={14} style={{ color: '#F472B6' }} />}
            label="LIVE INTERACTIVE EXPERIENCE"
            sx={{
              mb: 2.5,
              px: 1.5,
              py: 0.5,
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              bgcolor: 'rgba(236, 72, 153, 0.12)',
              color: '#F472B6',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)',
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
              fontWeight: 800,
              letterSpacing: '-0.025em',
              mb: 2.5,
              background: 'linear-gradient(135deg, #FFFFFF 20%, #E2E8F0 60%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Explore Handcrafted Wedding Templates
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#94A3B8',
              maxWidth: 720,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.6,
            }}
          >
            Select any template to see a real-time live preview rendered inside the interactive smartphone frame.
            Each design is fully responsive and customizable.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
            <CircularProgress sx={{ color: '#C084FC' }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' },
              gap: { xs: 6, lg: 8 },
              alignItems: 'start',
            }}
          >
            {/* LEFT COLUMN: TEMPLATE CARDS */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                  px: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Layers size={20} color="#C084FC" />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFF', fontSize: '1.25rem' }}>
                    Available Templates
                  </Typography>
                </Box>
                <Chip
                  label={`${templates.length} Curated Designs`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: '#94A3B8',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontWeight: 600,
                  }}
                />
              </Box>

              {/* Grid of Template Cards */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                {templates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;
                  const previewImg = template.desktopScreenshotUrl || template.mobileScreenshotUrl;
                  const formattedTitle = template.type.replace(/__/g, ' ');

                  return (
                    <Card
                      key={template.id}
                      onClick={() => handleSelectTemplate(template.id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: '16px',
                        bgcolor: isSelected ? 'rgba(157, 78, 221, 0.12)' : 'rgba(15, 26, 46, 0.65)',
                        backdropFilter: 'blur(16px)',
                        border: isSelected
                          ? '2px solid #C084FC'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: isSelected
                          ? '0 12px 35px rgba(157, 78, 221, 0.35), 0 0 20px rgba(192, 132, 252, 0.2)'
                          : '0 8px 24px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isSelected ? 'translateY(-4px)' : 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          borderColor: isSelected ? '#C084FC' : 'rgba(192, 132, 252, 0.4)',
                          boxShadow: '0 16px 36px rgba(124, 58, 237, 0.25)',
                        },
                      }}
                    >
                      {/* Active Preview Badge */}
                      {isSelected && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: 'rgba(124, 58, 237, 0.9)',
                            backdropFilter: 'blur(8px)',
                            color: '#FFF',
                            px: 1.2,
                            py: 0.4,
                            borderRadius: 999,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            boxShadow: '0 0 15px rgba(157, 78, 221, 0.6)',
                          }}
                        >
                          <CheckCircle2 size={12} />
                          Active Preview
                        </Box>
                      )}

                      {/* Image Thumbnail */}
                      <Box
                        sx={{
                          position: 'relative',
                          height: 180,
                          bgcolor: '#030912',
                          overflow: 'hidden',
                        }}
                      >
                        {previewImg ? (
                          <Box
                            component="img"
                            src={previewImg}
                            alt={formattedTitle}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'top',
                              transition: 'transform 0.4s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                              },
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                              gap: 1,
                            }}
                          >
                            <Sparkles size={28} color="#C084FC" />
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                              Interactive Design
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Card Content */}
                      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#FFF',
                              fontWeight: 700,
                              fontSize: '1rem',
                              textTransform: 'capitalize',
                              mb: 0.5,
                            }}
                          >
                            {formattedTitle}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.78rem' }}>
                            Modern • Digital RSVP • Custom Domain Ready
                          </Typography>
                        </Box>

                        {/* Card Action Buttons */}
                        <Box
                          sx={{
                            mt: 'auto',
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                          }}
                        >
                          <Button
                            fullWidth
                            size="small"
                            variant={isSelected ? 'contained' : 'outlined'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTemplate(template.id);
                            }}
                            startIcon={<Smartphone size={14} />}
                            sx={{
                              py: 0.8,
                              borderRadius: 2.5,
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              background: isSelected
                                ? 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)'
                                : 'transparent',
                              borderColor: isSelected ? 'transparent' : 'rgba(168, 85, 247, 0.4)',
                              color: isSelected ? '#FFF' : '#C084FC',
                              '&:hover': {
                                background: isSelected
                                  ? 'linear-gradient(90deg, #6D28D9 0%, #9D4EDD 100%)'
                                  : 'rgba(168, 85, 247, 0.1)',
                              },
                            }}
                          >
                            {isSelected ? 'Previewing' : 'View in Phone'}
                          </Button>

                          <Tooltip title="Open Live Fullscreen Demo">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(template.url, '_blank');
                              }}
                              sx={{
                                color: '#94A3B8',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 2.5,
                                p: 0.8,
                                '&:hover': {
                                  color: '#FFF',
                                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                                  borderColor: '#C084FC',
                                },
                              }}
                            >
                              <ArrowUpRight size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>

            {/* RIGHT COLUMN: INTERACTIVE SMARTPHONE WITH TOP DROPDOWN */}
            <Box
              sx={{
                position: { lg: 'sticky' },
                top: { lg: 90 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* TOP CONTROLLER BAR & DROPDOWN */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '380px',
                  mb: 2.5,
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: 'rgba(15, 26, 46, 0.85)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#10B981',
                        boxShadow: '0 0 10px #10B981',
                        animation: 'glowPulse 2s infinite',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700, letterSpacing: '0.04em' }}>
                      LIVE INTERACTIVE PREVIEW
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Reload Preview">
                      <IconButton
                        size="small"
                        onClick={handleReloadIframe}
                        sx={{
                          color: '#94A3B8',
                          p: 0.5,
                          '&:hover': { color: '#C084FC', bgcolor: 'rgba(157, 78, 221, 0.15)' },
                        }}
                      >
                        <RefreshCw size={15} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Open in New Tab">
                      <IconButton
                        size="small"
                        onClick={() => selectedTemplate && window.open(selectedTemplate.url, '_blank')}
                        sx={{
                          color: '#94A3B8',
                          p: 0.5,
                          '&:hover': { color: '#C084FC', bgcolor: 'rgba(157, 78, 221, 0.15)' },
                        }}
                      >
                        <ExternalLink size={15} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* TEMPLATE SWITCHER DROPDOWN */}
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => handleSelectTemplate(Number(e.target.value))}
                    sx={{
                      bgcolor: 'rgba(3, 9, 18, 0.8)',
                      borderRadius: 3,
                      color: '#FFF',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      '& .MuiSelect-select': {
                        py: 1,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&:hover': {
                        border: '1px solid rgba(192, 132, 252, 0.6)',
                        boxShadow: '0 0 15px rgba(157, 78, 221, 0.2)',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#0F1A2E',
                          borderRadius: 3,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                          color: '#FFF',
                          '& .MuiMenuItem-root': {
                            fontSize: '0.88rem',
                            fontWeight: 500,
                            py: 1.2,
                            px: 2,
                            borderRadius: 2,
                            mx: 0.5,
                            my: 0.3,
                            '&:hover': {
                              bgcolor: 'rgba(157, 78, 221, 0.15)',
                              color: '#C084FC',
                            },
                            '&.Mui-selected': {
                              bgcolor: 'rgba(157, 78, 221, 0.25)',
                              color: '#FFF',
                              fontWeight: 700,
                            },
                          },
                        },
                      },
                    }}
                  >
                    {templates.map((tmpl) => (
                      <MenuItem key={tmpl.id} value={tmpl.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Sparkles size={14} color="#C084FC" />
                          <Typography sx={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>
                            {tmpl.type.replace(/__/g, ' ')} Template
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* REALISTIC PHONE FRAME CONTAINER */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '360px',
                  height: '660px',
                  borderRadius: '44px',
                  bgcolor: '#0A0F1D',
                  p: '12px',
                  border: '4px solid #1E293B',
                  boxShadow:
                    '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(157, 78, 221, 0.25), inset 0 0 12px rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow:
                      '0 30px 70px rgba(0, 0, 0, 0.9), 0 0 45px rgba(157, 78, 221, 0.4)',
                  },
                }}
              >
                {/* Phone Dynamic Island / Camera Notch */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100px',
                    height: '24px',
                    bgcolor: '#000',
                    borderRadius: '20px',
                    zIndex: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.2,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1E293B' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#0D1424' }} />
                </Box>

                {/* Inner Screen Display */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '34px',
                    overflow: 'hidden',
                    bgcolor: '#FFF',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Iframe Loading Overlay */}
                  {iframeLoading && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 20,
                        bgcolor: '#0F1A2E',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      <CircularProgress size={36} sx={{ color: '#C084FC' }} />
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                        Loading Live Template...
                      </Typography>
                    </Box>
                  )}

                  {/* The Live Iframe */}
                  {selectedTemplate?.url && (
                    <iframe
                      key={iframeKey}
                      src={selectedTemplate.url}
                      title={`Preview of ${selectedTemplate.type}`}
                      onLoad={() => setIframeLoading(false)}
                      onError={() => setIframeLoading(false)}
                      allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture"
                      loading="eager"
                      referrerPolicy="no-referrer-when-downgrade"
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        display: 'block',
                      }}
                    />
                  )}

                  {/* Bottom Home Indicator Bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '110px',
                      height: '4px',
                      borderRadius: '999px',
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      zIndex: 30,
                      pointerEvents: 'none',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default InteractiveTemplatesSection;
