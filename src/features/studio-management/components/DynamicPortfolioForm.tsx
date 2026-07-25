import React, { useEffect } from 'react';
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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useConfigStore } from '../../../core/store/ConifgStore';

interface DynamicPortfolioFormProps {
  data: any;
  onChange: (newData: any) => void;
}

const DynamicPortfolioForm: React.FC<DynamicPortfolioFormProps> = ({ data, onChange }) => {
  const { setShowNavBar } = useConfigStore();

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
    if (Array.isArray(value)) {
      return (
        <Box key={path.join('.')} sx={{ mb: 3 }}>
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
        <Box key={path.join('.')} sx={{ mb: 3 }}>
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
        <TextField
          key={path.join('.')}
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
    </Box>
  );
};

export default DynamicPortfolioForm;
