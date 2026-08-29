import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { useConfigStore } from '../../../core/store/ConifgStore';
import { usePortfolioStore } from '../store/portfolioStore';
import { usePortfolioContext } from '../context/portfolioGlobalContext';
import { scrollToJsonPath } from '../functions/scrollToJsonPath';

// Reserved top-level keys that are handled specially (not rendered as content sections)
const RESERVED_KEYS = new Set(['activeTheme', 'theme']);

// ---------------------------------------------------------------------------
// LeafField — isolated, memoized text field.
// Has its own local display state, so ONLY this component re-renders on
// each keystroke — not the entire form tree.
// Commits the value up to the parent only after 300ms of inactivity.
// ---------------------------------------------------------------------------
interface LeafFieldProps {
  fieldKey: string;
  initialValue: any;
  fieldId: string;
  path: string[];
  onCommit: (path: string[], value: string) => void;
  onAssetPick: (path: string[]) => void;
  detailedPath: string;
}

const LeafField = React.memo(({
  fieldKey,
  initialValue,
  fieldId,
  path,
  onCommit,
  onAssetPick,
  detailedPath
}: LeafFieldProps) => {
  const { managePortfolioController } = usePortfolioContext();
  const { iframeRef } = managePortfolioController;

  const [localValue, setLocalValue] = useState<string>(initialValue ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep path in a ref so the debounce closure always has the latest path
  const pathRef = useRef(path);
  pathRef.current = path;

  // The last value we committed upward — used to detect genuine external changes
  const committedRef = useRef<string>(initialValue ?? '');

  // Sync only when the parent pushes a value different from what we last committed
  // (e.g. version load, asset picker selection). Ignores our own commits.
  useEffect(() => {
    const incoming = initialValue ?? '';
    if (incoming !== committedRef.current) {
      committedRef.current = incoming;
      setLocalValue(incoming);
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val); // instant — zero form-tree re-render
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      committedRef.current = val;
      onCommit(pathRef.current, val);
    }, 300);
  };

  return (
    <Box id={fieldId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        label={fieldKey}
        value={localValue}
        onChange={handleChange}
        onFocus={() => {
          scrollToJsonPath(iframeRef, detailedPath)
        }}
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
        onClick={() => onAssetPick(path)}
        sx={{
          color: '#C084FC',
          bgcolor: 'rgba(192, 132, 252, 0.1)',
          mt: 1,
          '&:hover': { bgcolor: 'rgba(192, 132, 252, 0.2)' },
        }}
        title="Choose Asset"
      >
        <ImageIcon />
      </IconButton>
    </Box>
  );
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEmptyTemplate(obj: any): any {
  if (Array.isArray(obj)) return [];
  if (typeof obj === 'object' && obj !== null) {
    const template: any = {};
    Object.keys(obj).forEach(key => { template[key] = getEmptyTemplate(obj[key]); });
    return template;
  }
  if (typeof obj === 'number') return 0;
  if (typeof obj === 'boolean') return false;
  return '';
}

/** Immutably update a deeply nested path — O(depth), not O(size). */
function setByPath(obj: any, path: string[], value: any): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  clone[head as any] = setByPath((obj as any)[head], rest, value);
  return clone;
}

/** Read a deeply nested value by path. */
function getByPath(obj: any, path: string[]): any {
  return path.reduce((acc, key) => acc?.[key], obj);
}

// ---------------------------------------------------------------------------
// Main Form
// ---------------------------------------------------------------------------

const DynamicPortfolioForm: React.FC = () => {
  const { managePortfolioController } = usePortfolioContext();

  const {
    portfolioData,
    handleDataChange } = managePortfolioController;


  const { setShowNavBar } = useConfigStore();
  const { uploadedImages } = usePortfolioStore();

  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [activeFieldPath, setActiveFieldPath] = useState<string[] | null>(null);

  // Mutable ref holding the latest full data object.
  // Text-field commits update this WITHOUT triggering a form re-render.
  const dataRef = useRef<any>(portfolioData);

  // Tracks the last value we ourselves committed upward via handleLeafCommit.
  // When portfolioData changes because of our own commit, it will match this ref
  // and we'll skip the formKey bump (which would unmount & collapse accordions).
  const lastExternalRef = useRef<any>(portfolioData);

  const [prevData, setPrevData] = useState(portfolioData);
  const [formKey, setFormKey] = useState(0);

  if (portfolioData !== prevData) {
    setPrevData(portfolioData);
    // Only remount the form tree for genuinely external changes
    // (e.g. version load, initial load). Our own leaf commits set
    // lastExternalRef right before calling handleDataChange, so those
    // will match and be skipped here.
    if (portfolioData !== lastExternalRef.current) {
      lastExternalRef.current = portfolioData;
      dataRef.current = portfolioData; // Keep dataRef in sync with external changes
      setFormKey(k => k + 1);
    }
  }

  useEffect(() => {
    setShowNavBar(false);
    return () => { setShowNavBar(true); };
  }, [setShowNavBar]);

  // Called by LeafField after its 300ms debounce.
  // Uses setByPath — cheap structural clone, NOT JSON.parse/stringify.
  const handleLeafCommit = useCallback((path: string[], value: string) => {
    const newData = setByPath(dataRef.current, path, value);
    dataRef.current = newData;
    lastExternalRef.current = newData;
    handleDataChange(newData);
  }, [handleDataChange]);

  const handleAssetPick = useCallback((path: string[]) => {
    setActiveFieldPath(path);
    setIsAssetDialogOpen(true);
  }, []);

  const handleArrayAdd = useCallback((path: string[], defaultItem: any) => {
    const current = getByPath(dataRef.current, path);
    if (!Array.isArray(current)) return;
    const newData = setByPath(dataRef.current, path, [...current, defaultItem]);
    dataRef.current = newData;
    lastExternalRef.current = newData;
    handleDataChange(newData);
    setFormKey(k => k + 1);
  }, [handleDataChange]);

  const handleArrayRemove = useCallback((path: string[], index: number) => {
    const current = getByPath(dataRef.current, path);
    if (!Array.isArray(current)) return;
    const newArr = current.filter((_: any, i: number) => i !== index);
    const newData = setByPath(dataRef.current, path, newArr);
    dataRef.current = newData;
    lastExternalRef.current = newData;
    handleDataChange(newData);
    setFormKey(k => k + 1);
  }, [handleDataChange]);

  const handleSectionRemove = useCallback((sectionKey: string) => {
    const current = dataRef.current;
    if (!current || typeof current !== 'object') return;
    const { [sectionKey]: _, ...rest } = current;
    dataRef.current = rest;
    lastExternalRef.current = rest;
    handleDataChange(rest);
    setFormKey(k => k + 1);
  }, [handleDataChange]);

  const renderField = (key: string, value: any, path: string[], detailedPath: string = '') => {
    const fieldId = path.join('.');

    if (Array.isArray(value)) {
      return (
        <Box key={fieldId} id={fieldId} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ color: '#F8FAFC', textTransform: 'capitalize' }}>
              {key}
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={() => handleArrayAdd(path, value.length > 0 ? getEmptyTemplate(value[0]) : {})}
              sx={{
                color: '#C084FC',
                borderColor: 'rgba(192, 132, 252, 0.5)',
                '&:hover': { borderColor: '#C084FC', background: 'rgba(192, 132, 252, 0.1)' },
              }}
            >
              Add Item
            </Button>
          </Box>
          <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
          {value.map((item: any, index: number) => {
            const itemPath = [...path, index.toString()];
            const itemId = itemPath.join('.');
            const isPrimitive = item === null || typeof item !== 'object';
            const detailedPathNew = `${detailedPath}[${index}]`;

            return (
              <Accordion key={index} sx={{ background: 'rgba(255,255,255,0.05)', mb: 1, color: '#fff' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                  <Typography>
                    Item {index + 1}{!isPrimitive && (item.title || item.name) ? ` - ${item.title || item.name}` : ''}
                  </Typography>
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
                      {isPrimitive ? (
                        <LeafField
                          key={itemId}
                          fieldId={itemId}
                          fieldKey={`Item ${index + 1}`}
                          initialValue={item}
                          path={itemPath}
                          onCommit={handleLeafCommit}
                          onAssetPick={handleAssetPick}
                          detailedPath={detailedPathNew}
                        />
                      ) : (
                        Object.entries(item).map(([subKey, subValue]) =>
                          renderField(subKey, subValue, [...itemPath, subKey], detailedPathNew + '.' + subKey)
                        )
                      )}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <Box key={fieldId} id={fieldId} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#F8FAFC', textTransform: 'capitalize' }}>
            {key}
          </Typography>
          <Box sx={{ pl: 2, borderLeft: '2px solid rgba(192, 132, 252, 0.3)' }}>
            {Object.entries(value).map(([subKey, subValue]) =>
              renderField(subKey, subValue, [...path, subKey], detailedPath + '.' + subKey)
            )}
          </Box>
        </Box>
      );
    }

    // Primitive — render isolated memoized LeafField
    return (
      <LeafField
        key={fieldId}
        fieldId={fieldId}
        fieldKey={key}
        initialValue={value}
        path={path}
        onCommit={handleLeafCommit}
        onAssetPick={handleAssetPick}
        detailedPath={detailedPath}
      />
    );
  };

  if (!portfolioData) return null;

  // Extract theme data for the dropdown
  const themeArray: any[] = Array.isArray(portfolioData.theme) ? portfolioData.theme : [];
  const activeTheme: string = portfolioData.activeTheme ?? '';
  const hasThemeSupport = themeArray.length > 0;

  const handleThemeChange = (e: SelectChangeEvent<string>) => {
    const newData = setByPath(dataRef.current, ['activeTheme'], e.target.value);
    dataRef.current = newData;
    lastExternalRef.current = newData;
    handleDataChange(newData);
  };

  return (
    <Box key={formKey}>
      {/* ── Theme Selector (only if theme data exists) ── */}
      {hasThemeSupport && (
        <Box
          sx={{
            mb: 4,
            background: 'rgba(15, 26, 46, 0.4)',
            p: 3,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PaletteIcon sx={{ color: '#C084FC' }} />
            <Typography variant="h6" sx={{ color: '#F8FAFC' }}>
              Theme
            </Typography>
          </Box>
          <FormControl fullWidth variant="outlined">
            <InputLabel
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': { color: '#C084FC' },
              }}
            >
              Active Theme
            </InputLabel>
            <Select
              value={activeTheme}
              label="Active Theme"
              onChange={handleThemeChange}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.4)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#C084FC',
                },
                '& .MuiSvgIcon-root': { color: '#C084FC' },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    '& .MuiMenuItem-root': {
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgba(192, 132, 252, 0.15)' },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(192, 132, 252, 0.25)',
                        '&:hover': { bgcolor: 'rgba(192, 132, 252, 0.35)' },
                      },
                    },
                  },
                },
              }}
            >
              {themeArray.map((t: any) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name || t.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* ── Content Sections (skip reserved keys) ── */}
      {Object.entries(portfolioData)
        .filter(([key]) => !RESERVED_KEYS.has(key))
        .map(([key, value]) => {
          const sectionContent = value && typeof value === 'object' && 'content' in value
            ? (value as any).content
            : value;

          return (
            <Box key={key} sx={{ mb: 4, background: 'rgba(15, 26, 46, 0.4)', p: 3, borderRadius: 2, position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#F8FAFC', textTransform: 'capitalize' }}>
                  {key}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleSectionRemove(key)}
                  sx={{
                    color: '#94A3B8',
                    '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
                  }}
                  title={`Delete ${key} section`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ pl: 2, borderLeft: '2px solid rgba(192, 132, 252, 0.3)' }}>
                {sectionContent && typeof sectionContent === 'object' && !Array.isArray(sectionContent)
                  ? Object.entries(sectionContent).map(([subKey, subValue]) =>
                      renderField(subKey, subValue, [key, 'content', subKey], `${key}.content.${subKey}`)
                    )
                  : renderField(key, sectionContent, [key, 'content'], `${key}.content`)
                }
              </Box>
            </Box>
          );
        })}


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
                      handleLeafCommit(activeFieldPath, finalUrl);
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
                      secondary={img.file && img.file.size > 0 ? (img.file.size / 1024).toFixed(2) + ' KB' : ''}
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
