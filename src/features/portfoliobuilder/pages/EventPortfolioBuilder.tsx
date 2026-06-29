import React, { useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardActionArea,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  CheckCircle as CheckCircleIcon,
  Image as ImageIcon,
  Event as EventIcon,
  Place as PlaceIcon,
  PhotoLibrary as PhotoLibraryIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { usePortfolioBuilderStore } from '../store/portfolioBuilderStore';
import { TEMPLATES } from '../types/types';
import { savePortfolio, publishPortfolio } from '../services/portfolioService';
import { auth } from '../../../config/firebase';

const EventPortfolioBuilder: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    formData,
    selectedTemplate,
    eventPath,
    isSaving,
    portfolioId,
    setFormData,
    setTemplate,
    setEventPath,
    setIsSaving,
    setPortfolioId,
    updateDetail,
    addDetail,
    removeDetail,
    updateGalleryItem,
    addGalleryItem,
    removeGalleryItem,
  } = usePortfolioBuilderStore();

  // Send data to iframe whenever formData changes (debounced)
  const sendDataToIframe = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'UPDATE_DATA', data: formData },
        '*'
      );
    }
  }, [formData]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      sendDataToIframe();
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [formData, sendDataToIframe]);

  // Listen for TEMPLATE_READY from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'TEMPLATE_READY') {
        sendDataToIframe();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [sendDataToIframe]);

  const handleSave = async () => {
    if (!eventPath.trim()) {
      setSnackbar({ open: true, message: 'Please enter an event path (URL slug)', severity: 'error' });
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setSnackbar({ open: true, message: 'Please log in to save', severity: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      const id = await savePortfolio(user.uid, {
        id: portfolioId || undefined,
        eventType: 'wedding',
        eventPath: eventPath.trim(),
        templateId: selectedTemplate,
        data: formData,
        published: false,
      });
      setPortfolioId(id);
      setSnackbar({ open: true, message: 'Draft saved successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to save draft', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!eventPath.trim()) {
      setSnackbar({ open: true, message: 'Please enter an event path (URL slug)', severity: 'error' });
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setSnackbar({ open: true, message: 'Please log in to publish', severity: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      // Save first, then publish
      const id = await savePortfolio(user.uid, {
        id: portfolioId || undefined,
        eventType: 'wedding',
        eventPath: eventPath.trim(),
        templateId: selectedTemplate,
        data: formData,
        published: true,
      });
      setPortfolioId(id);
      await publishPortfolio(id);
      setSnackbar({ open: true, message: `Published! View at /p/${eventPath.trim()}`, severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to publish', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setTemplate(templateId);
    // Force iframe reload when template changes
    if (iframeRef.current) {
      iframeRef.current.src = `/html/${templateId}.html`;
    }
  };

  const sectionStyle = {
    mb: 3,
    p: 2.5,
    borderRadius: 3,
    bgcolor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  };

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2,
    color: 'primary.light',
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Left Panel - Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '480px' },
          minWidth: '400px',
          overflow: 'auto',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          p: 3,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(157,78,221,0.3)', borderRadius: '3px' },
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Wedding Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize your wedding invitation page
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
            fullWidth
            size="small"
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={handlePublish}
            disabled={isSaving}
            fullWidth
            size="small"
          >
            Publish
          </Button>
        </Box>

        {/* Event Path */}
        <Box sx={sectionStyle}>
          <Box sx={sectionHeaderStyle}>
            <LinkIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>Event URL</Typography>
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="my-wedding"
            value={eventPath}
            onChange={(e) => setEventPath(e.target.value.replace(/[^a-z0-9-]/g, ''))}
            helperText={eventPath ? `Preview: /p/${eventPath}` : 'Enter a unique URL slug'}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontSize: '0.85rem' }}>/p/</Typography>,
            }}
          />
        </Box>

        {/* Template Selector */}
        <Box sx={sectionStyle}>
          <Box sx={sectionHeaderStyle}>
            <DescriptionIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>Template</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {TEMPLATES.map((t) => (
              <Card
                key={t.id}
                sx={{
                  flex: 1,
                  cursor: 'pointer',
                  border: selectedTemplate === t.id ? '2px solid' : '1px solid rgba(255,255,255,0.08)',
                  borderColor: selectedTemplate === t.id ? 'primary.main' : undefined,
                  bgcolor: selectedTemplate === t.id ? 'rgba(157,78,221,0.08)' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.light' },
                }}
              >
                <CardActionArea onClick={() => handleTemplateChange(t.id)} sx={{ p: 1.5, textAlign: 'center' }}>
                  {selectedTemplate === t.id && (
                    <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 18, mb: 0.5 }} />
                  )}
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', fontSize: '0.7rem' }}>
                    {t.name}
                  </Typography>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Couple Info */}
        <Box sx={sectionStyle}>
          <Box sx={sectionHeaderStyle}>
            <PeopleIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>Couple Info</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Name 1"
              value={formData.name1}
              onChange={(e) => setFormData({ name1: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Name 2"
              value={formData.name2}
              onChange={(e) => setFormData({ name2: e.target.value })}
            />
          </Box>
          <TextField
            fullWidth
            size="small"
            label="Wedding Date"
            value={formData.mainDate}
            onChange={(e) => setFormData({ mainDate: e.target.value })}
            placeholder="Saturday, June 21, 2025"
          />
        </Box>

        {/* Hero Image */}
        <Box sx={sectionStyle}>
          <Box sx={sectionHeaderStyle}>
            <ImageIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>Hero Image</Typography>
          </Box>
          <TextField
            fullWidth
            size="small"
            label="Image URL"
            value={formData.heroImage.url}
            onChange={(e) => setFormData({ heroImage: { url: e.target.value } })}
          />
          {formData.heroImage.url && (
            <Box
              sx={{
                mt: 1.5,
                height: 120,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <img
                src={formData.heroImage.url}
                alt="Hero preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </Box>
          )}
        </Box>

        {/* Story */}
        <Box sx={sectionStyle}>
          <Box sx={sectionHeaderStyle}>
            <DescriptionIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>Story</Typography>
          </Box>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label="Your Love Story"
            value={formData.story}
            onChange={(e) => setFormData({ story: e.target.value })}
          />
        </Box>

        {/* Invitation */}
        <Box sx={sectionStyle}>
          <Box sx={sectionHeaderStyle}>
            <EventIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>Invitation</Typography>
          </Box>
          <TextField
            fullWidth
            size="small"
            label="Heading"
            value={formData.invitationHeading}
            onChange={(e) => setFormData({ invitationHeading: e.target.value })}
            sx={{ mb: 1.5 }}
          />
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label="Description"
            value={formData.invitationDescription}
            onChange={(e) => setFormData({ invitationDescription: e.target.value })}
          />
        </Box>

        {/* Event Details */}
        <Box sx={sectionStyle}>
          <Box sx={{ ...sectionHeaderStyle, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlaceIcon fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>Event Details</Typography>
              <Chip label={formData.details.length} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
            </Box>
            <IconButton size="small" onClick={addDetail} color="primary">
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>

          {formData.details.map((detail, idx) => (
            <Paper
              key={idx}
              sx={{
                p: 2,
                mb: 1.5,
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Chip
                  label={`${detail.type.toUpperCase()} #${idx + 1}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.65rem', height: 22 }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeDetail(idx)}
                  color="error"
                  disabled={formData.details.length <= 1}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={detail.type}
                    label="Type"
                    onChange={(e) => updateDetail(idx, { type: e.target.value })}
                  >
                    <MenuItem value="ceremony">Ceremony</MenuItem>
                    <MenuItem value="reception">Reception</MenuItem>
                    <MenuItem value="party">Party</MenuItem>
                    <MenuItem value="dinner">Dinner</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  size="small"
                  label="Time"
                  value={detail.time}
                  onChange={(e) => updateDetail(idx, { time: e.target.value })}
                />
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Location Name"
                value={detail.location.name}
                onChange={(e) =>
                  updateDetail(idx, { location: { ...detail.location, name: e.target.value } })
                }
                sx={{ mb: 1.5 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Map Embed URL"
                value={detail.location.url}
                onChange={(e) =>
                  updateDetail(idx, { location: { ...detail.location, url: e.target.value } })
                }
                sx={{ mb: 1.5 }}
              />
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Description"
                value={detail.location.desc}
                onChange={(e) =>
                  updateDetail(idx, { location: { ...detail.location, desc: e.target.value } })
                }
              />
            </Paper>
          ))}
        </Box>

        {/* Gallery */}
        <Box sx={sectionStyle}>
          <Box sx={{ ...sectionHeaderStyle, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhotoLibraryIcon fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>Gallery</Typography>
              <Chip label={formData.gallery.length} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
            </Box>
            <IconButton size="small" onClick={addGalleryItem} color="primary">
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>

          {formData.gallery.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                gap: 1,
                mb: 1.5,
                alignItems: 'center',
              }}
            >
              {item.url && (
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <img
                    src={item.url}
                    alt={`Gallery ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </Box>
              )}
              <TextField
                fullWidth
                size="small"
                label={`Image ${idx + 1} URL`}
                value={item.url}
                onChange={(e) => updateGalleryItem(idx, e.target.value)}
              />
              <IconButton
                size="small"
                onClick={() => removeGalleryItem(idx)}
                color="error"
                disabled={formData.gallery.length <= 1}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>

        {/* Spacer for bottom padding */}
        <Box sx={{ height: 80 }} />
      </Box>

      {/* Right Panel - Preview */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Preview Header */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'rgba(255,255,255,0.02)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Preview
            </Typography>
            <Chip
              label={TEMPLATES.find((t) => t.id === selectedTemplate)?.name || selectedTemplate}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          </Box>
          {eventPath && (
            <Typography variant="caption" color="text.secondary">
              /p/{eventPath}
            </Typography>
          )}
        </Box>

        {/* iframe Preview */}
        <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: '#fff' }}>
          <iframe
            ref={iframeRef}
            src={`/html/${selectedTemplate}.html`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Template Preview"
          />
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventPortfolioBuilder;
