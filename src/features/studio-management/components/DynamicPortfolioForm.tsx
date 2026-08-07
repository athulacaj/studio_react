import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { useConfigStore } from '../../../core/store/ConifgStore';
import { usePortfolioStore } from '../store/portfolioStore';

interface DynamicPortfolioFormProps {
  data: any;
  onChange: (newData: any) => void;
}

const DynamicPortfolioForm: React.FC<DynamicPortfolioFormProps> = ({ data, onChange }) => {
  const { setShowNavBar } = useConfigStore();
  const { uploadedImages } = usePortfolioStore();

  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [activeFieldPath, setActiveFieldPath] = useState<string[] | null>(null);

  useEffect(() => {
    setShowNavBar(false);
    return () => {
      setShowNavBar(true);
    }
  }, [])
  const handleFieldChange = (path: string[], value: any) => {
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      if (current[path[i]] === undefined) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onChange(newData);
  };

  const handleArrayAdd = (path: string[], defaultItem: any) => {
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;
    for (let i = 0; i < path.length; i++) {
      if (current[path[i]] === undefined) current[path[i]] = [];
      current = current[path[i]];
    }
    if (Array.isArray(current)) {
      current.push(defaultItem);
      onChange(newData);
    }
  };

  const handleArrayRemove = (path: string[], index: number) => {
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;
    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }
    if (Array.isArray(current)) {
      current.splice(index, 1);
      onChange(newData);
    }
  };

  const renderField = (key: string, value: any, path: string[]) => {
    const fieldId = path.join('.');
    if (Array.isArray(value)) {
      return (
        <Box key={path.join('.')} id={fieldId} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ color: '#F8FAFC', textTransform: 'capitalize' }}>
              {key}
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={() => {
                const defaultItem = value.length > 0 ? getEmptyTemplate(value[0]) : {};
                handleArrayAdd(path, defaultItem);
              }}
              sx={{
                color: '#C084FC',
                borderColor: 'rgba(192, 132, 252, 0.5)',
                '&:hover': { borderColor: '#C084FC', background: 'rgba(192, 132, 252, 0.1)' }
              }}
            >
              Add Item
            </Button>
          </Box>
          <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
          {value.map((item, index) => (
            <Accordion key={index} sx={{ background: 'rgba(255,255,255,0.05)', mb: 1, color: '#fff' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                <Typography>Item {index + 1} {item.title || item.name ? `- ${item.title || item.name}` : ''}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ position: 'relative' }}>
                  <IconButton
                    size="small"
                    color="error"
                    sx={{ position: 'absolute', top: -10, right: 0 }}
                    onClick={() => handleArrayRemove(path, index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Box sx={{ pt: 2 }}>
                    {Object.entries(item).map(([subKey, subValue]) =>
                      renderField(subKey, subValue, [...path, index.toString(), subKey])
                    )}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <Box key={path.join('.')} id={fieldId} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#F8FAFC', textTransform: 'capitalize' }}>
            {key}
          </Typography>
          <Box sx={{ pl: 2, borderLeft: '2px solid rgba(192, 132, 252, 0.3)' }}>
            {Object.entries(value).map(([subKey, subValue]) =>
              renderField(subKey, subValue, [...path, subKey])
            )}
          </Box>
        </Box>
      );
    } else {
      return (
        <Box key={path.join('.')} id={fieldId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label={key}
            value={value || ''}
            onChange={(e) => handleFieldChange(path, e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#C084FC' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#C084FC' },
            }}
          />
          <IconButton
            onClick={() => {
              setActiveFieldPath(path);
              setIsAssetDialogOpen(true);
            }}
            sx={{
              color: '#C084FC',
              bgcolor: 'rgba(192, 132, 252, 0.1)',
              mt: 1,
              '&:hover': { bgcolor: 'rgba(192, 132, 252, 0.2)' }
            }}
            title="Choose Asset"
          >
            <ImageIcon />
          </IconButton>
        </Box>
      );
    }
  };

  const getEmptyTemplate = (obj: any): any => {
    if (Array.isArray(obj)) return [];
    if (typeof obj === 'object' && obj !== null) {
      const template: any = {};
      Object.keys(obj).forEach(key => {
        template[key] = getEmptyTemplate(obj[key]);
      });
      return template;
    }
    if (typeof obj === 'number') return 0;
    if (typeof obj === 'boolean') return false;
    return '';
  };

  if (!data) return null;

  return (
    <Box>
      {Object.entries(data).map(([key, value]) => (
        <Box key={key} sx={{ mb: 4, background: 'rgba(15, 26, 46, 0.4)', p: 3, borderRadius: 2 }}>
          {renderField(key, value, [key])}
        </Box>
      ))}

      <Dialog 
        open={isAssetDialogOpen} 
        onClose={() => setIsAssetDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ sx: { bgcolor: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Select an Asset</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {uploadedImages.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography sx={{ color: '#94A3B8' }}>No assets uploaded yet.</Typography>
              </Box>
          ) : (
              <List sx={{ p: 0 }}>
                {uploadedImages.map((img) => (
                  <ListItem key={img.id} disablePadding sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <ListItemButton onClick={() => {
                      if (activeFieldPath) {
                        const finalUrl = img.fileKey 
                          ? `${import.meta.env.VITE_R2_BASEURL}/${img.fileKey}` 
                          : img.url;
                        handleFieldChange(activeFieldPath, finalUrl);
                      }
                      setIsAssetDialogOpen(false);
                    }}>
                      <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'transparent', borderRadius: 1 }}>
                              {img.file?.type.startsWith('image/') || img.url.endsWith('.webp') || img.url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                  <img src={img.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                  <FileIcon sx={{ color: '#94A3B8' }} />
                              )}
                          </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                          primary={img.file?.name || img.fileKey || 'Asset'} 
                          secondary={`${img.file && img.file.size > 0 ? (img.file.size / 1024).toFixed(2) + ' KB' : ''}`}
                          primaryTypographyProps={{ color: '#fff', noWrap: true }}
                          secondaryTypographyProps={{ color: '#94A3B8' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          <Button onClick={() => setIsAssetDialogOpen(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DynamicPortfolioForm;
