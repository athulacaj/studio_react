import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  SelectChangeEvent,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Palette as PaletteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  SearchOff as SearchOffIcon,
  NavigateNext as ChevronRightIcon,
  Layers as LayersIcon
} from '@mui/icons-material';
import { useConfigStore } from '../../../core/store/ConifgStore';
import { usePortfolioStore } from '../store/portfolioStore';
import { usePortfolioContext } from '../context/portfolioGlobalContext';
import { scrollToJsonPath } from '../functions/scrollToJsonPath';

// Reserved top-level keys that are handled specially (not rendered as content sections)
const RESERVED_KEYS = new Set(['activeTheme', 'theme']);

// ---------------------------------------------------------------------------
// Searchable Field Item Interface
// ---------------------------------------------------------------------------
interface SearchableFieldItem {
  fieldId: string;
  fieldKey: string;
  value: any;
  path: string[];
  detailedPath: string;
  breadcrumbs: string[];
  sectionName: string;
}

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
  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  // The last value we committed upward — used to detect genuine external changes
  const committedRef = useRef<string>(initialValue ?? '');

  // Sync only when the parent pushes a value different from what we last committed
  // (e.g. version load, asset picker selection). Ignores our own commits.
  useEffect(() => {
    const incoming = initialValue ?? '';
    if (incoming !== committedRef.current) {
      committedRef.current = incoming;
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
          scrollToJsonPath(iframeRef, detailedPath);
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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('all');

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

  // Extract all searchable leaf fields with their breadcrumb paths
  const searchableFields = useMemo(() => {
    if (!portfolioData || typeof portfolioData !== 'object') return [];
    const results: SearchableFieldItem[] = [];

    const crawl = (
      node: any,
      path: string[],
      detailedPath: string,
      breadcrumbs: string[],
      sectionName: string
    ) => {
      if (node === null || typeof node !== 'object') {
        const fieldKey = breadcrumbs[breadcrumbs.length - 1] || path[path.length - 1] || 'field';
        results.push({
          fieldId: path.join('.'),
          fieldKey,
          value: node,
          path,
          detailedPath,
          breadcrumbs,
          sectionName,
        });
        return;
      }

      if (Array.isArray(node)) {
        node.forEach((item, index) => {
          const isPrimitive = item === null || typeof item !== 'object';
          const itemLabel = isPrimitive
            ? `Item ${index + 1}`
            : `Item ${index + 1}${item.title || item.name ? ` (${item.title || item.name})` : ''}`;
          const itemPath = [...path, index.toString()];
          const itemDetailedPath = `${detailedPath}[${index}]`;

          crawl(item, itemPath, itemDetailedPath, [...breadcrumbs, itemLabel], sectionName);
        });
        return;
      }

      Object.entries(node).forEach(([k, v]) => {
        crawl(
          v,
          [...path, k],
          detailedPath ? `${detailedPath}.${k}` : k,
          [...breadcrumbs, k],
          sectionName
        );
      });
    };

    Object.entries(portfolioData)
      .filter(([key]) => !RESERVED_KEYS.has(key))
      .forEach(([sectionKey, sectionVal]) => {
        const sectionContent =
          sectionVal && typeof sectionVal === 'object' && 'content' in sectionVal
            ? (sectionVal as any).content
            : sectionVal;
        const basePath =
          sectionVal && typeof sectionVal === 'object' && 'content' in sectionVal
            ? [sectionKey, 'content']
            : [sectionKey];
        const baseDetailed =
          sectionVal && typeof sectionVal === 'object' && 'content' in sectionVal
            ? `${sectionKey}.content`
            : sectionKey;

        crawl(sectionContent, basePath, baseDetailed, [sectionKey], sectionKey);
      });

    return results;
  }, [portfolioData]);

  // Filtered fields matching query and active section filter
  const filteredFields = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    return searchableFields.filter((item) => {
      const keyMatch = item.fieldKey.toLowerCase().includes(query);
      const valueMatch = String(item.value ?? '').toLowerCase().includes(query);
      const sectionMatch = item.sectionName.toLowerCase().includes(query);
      const breadcrumbMatch = item.breadcrumbs.some((b) => b.toLowerCase().includes(query));
      const pathMatch = item.detailedPath.toLowerCase().includes(query);

      const matchesQuery = keyMatch || valueMatch || sectionMatch || breadcrumbMatch || pathMatch;
      if (!matchesQuery) return false;

      if (selectedSectionFilter !== 'all') {
        return item.sectionName.toLowerCase() === selectedSectionFilter.toLowerCase();
      }

      return true;
    });
  }, [searchQuery, searchableFields, selectedSectionFilter]);

  // Sections that contain matches
  const matchedSections = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];
    const set = new Set<string>();
    searchableFields.forEach((item) => {
      const keyMatch = item.fieldKey.toLowerCase().includes(query);
      const valueMatch = String(item.value ?? '').toLowerCase().includes(query);
      const sectionMatch = item.sectionName.toLowerCase().includes(query);
      const breadcrumbMatch = item.breadcrumbs.some((b) => b.toLowerCase().includes(query));
      const pathMatch = item.detailedPath.toLowerCase().includes(query);

      if (keyMatch || valueMatch || sectionMatch || breadcrumbMatch || pathMatch) {
        set.add(item.sectionName);
      }
    });
    return Array.from(set);
  }, [searchQuery, searchableFields]);

  // Group filtered results by sectionName
  const groupedMatches = useMemo(() => {
    const groups: { [section: string]: SearchableFieldItem[] } = {};
    filteredFields.forEach((item) => {
      if (!groups[item.sectionName]) {
        groups[item.sectionName] = [];
      }
      groups[item.sectionName].push(item);
    });
    return groups;
  }, [filteredFields]);

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
              <Accordion
                key={index}
                id={itemId}
                sx={{
                  background: 'rgba(255,255,255,0.04)',
                  mb: 1.5,
                  color: '#fff',
                  borderRadius: '8px !important',
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    bgcolor: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(192, 132, 252, 0.3)'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#C084FC' }} />}
                  sx={{
                    px: { xs: 1.5, sm: 2 },
                    minHeight: 48,
                    '& .MuiAccordionSummary-content': { my: 1 }
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>
                    Item {index + 1}{!isPrimitive && (item.title || item.name) ? ` - ${item.title || item.name}` : ''}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 1.5, sm: 2 }, pb: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleArrayRemove(path, index)}
                      sx={{
                        color: '#EF4444',
                        bgcolor: 'rgba(239, 68, 68, 0.08)',
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1.5,
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(239, 68, 68, 0.18)',
                          borderColor: 'rgba(239, 68, 68, 0.4)'
                        }
                      }}
                    >
                      Delete Item
                    </Button>
                  </Box>
                  <Box>
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
          <Typography variant="h6" sx={{ mb: 1.5, color: '#F8FAFC', textTransform: 'capitalize', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            {key}
          </Typography>
          <Box sx={{ pl: { xs: 1.5, sm: 2 }, borderLeft: '2px solid rgba(192, 132, 252, 0.3)' }}>
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

  const isSearchActive = searchQuery.trim().length > 0;

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
    <Box key={formKey} sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* ── Sticky Search & Filter Bar ── */}
      <Box
        sx={{
          mb: 3,
          position: 'sticky',
          top: -16,
          zIndex: 10,
          bgcolor: 'rgba(15, 26, 46, 0.96)',
          backdropFilter: 'blur(12px)',
          py: 1,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search fields or values (e.g. title, bio, image)..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedSectionFilter('all');
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#C084FC', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSectionFilter('all');
                  }}
                  sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(3, 9, 18, 0.65)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.875rem',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
              '&:hover fieldset': { borderColor: 'rgba(192, 132, 252, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#C084FC', borderWidth: '1.5px' },
            }
          }}
        />

        {/* Search Status & Section Filter Tabs */}
        {isSearchActive && (
          <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Chip
              size="small"
              label={`${filteredFields.length} field${filteredFields.length === 1 ? '' : 's'} found`}
              sx={{
                bgcolor: 'rgba(124, 58, 237, 0.2)',
                color: '#C084FC',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                fontWeight: 700,
                fontSize: '0.72rem',
                borderRadius: 1,
                height: 24,
              }}
            />

            {matchedSections.length > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.75,
                  overflowX: 'auto',
                  maxWidth: '100%',
                  py: 0.5,
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' }
                }}
              >
                <Chip
                  size="small"
                  label={`All (${searchableFields.filter(f => f.fieldKey.toLowerCase().includes(searchQuery.toLowerCase()) || String(f.value).toLowerCase().includes(searchQuery.toLowerCase()) || f.breadcrumbs.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()))).length})`}
                  onClick={() => setSelectedSectionFilter('all')}
                  sx={{
                    height: 24,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: selectedSectionFilter === 'all' ? 'rgba(192, 132, 252, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedSectionFilter === 'all' ? '#FFF' : '#94A3B8',
                    border: selectedSectionFilter === 'all' ? '1px solid #C084FC' : '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                />
                {matchedSections.map((sec) => {
                  const isSelected = selectedSectionFilter.toLowerCase() === sec.toLowerCase();
                  return (
                    <Chip
                      key={sec}
                      size="small"
                      label={sec}
                      onClick={() => setSelectedSectionFilter(sec)}
                      sx={{
                        height: 24,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: 1,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'rgba(192, 132, 252, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? '#FFF' : '#94A3B8',
                        border: isSelected ? '1px solid #C084FC' : '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ── SEARCH RESULTS MODE ── */}
      {isSearchActive ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filteredFields.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 2,
                bgcolor: 'rgba(15, 23, 42, 0.4)',
                borderRadius: 2,
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <SearchOffIcon sx={{ fontSize: 48, color: '#475569', mb: 1.5 }} />
              <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 600, mb: 1, fontSize: '1rem' }}>
                No Fields Matching &ldquo;{searchQuery}&rdquo;
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 360, mx: 'auto', mb: 2, fontSize: '0.8125rem' }}>
                Try searching by section name (e.g. hero, about), field name (e.g. title, bio), or content text.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSectionFilter('all');
                }}
                sx={{
                  color: '#C084FC',
                  borderColor: 'rgba(192, 132, 252, 0.4)',
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                Clear Search
              </Button>
            </Box>
          ) : (
            Object.entries(groupedMatches).map(([sectionKey, fields]) => (
              <Box
                key={sectionKey}
                sx={{
                  mb: 1,
                  background: 'rgba(15, 26, 46, 0.45)',
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  border: '1px solid rgba(192, 132, 252, 0.2)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                  position: 'relative'
                }}
              >
                {/* Section Header with Icon and Result Count */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LayersIcon sx={{ color: '#C084FC', fontSize: 18 }} />
                    <Typography variant="h6" sx={{ color: '#F8FAFC', textTransform: 'capitalize', fontSize: { xs: '0.95rem', sm: '1.05rem' }, fontWeight: 700 }}>
                      {sectionKey} Section
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={`${fields.length} match${fields.length === 1 ? '' : 'es'}`}
                    sx={{
                      bgcolor: 'rgba(192, 132, 252, 0.15)',
                      color: '#C084FC',
                      border: '1px solid rgba(192, 132, 252, 0.3)',
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      borderRadius: 1,
                      height: 22,
                    }}
                  />
                </Box>

                {/* Matched Fields List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {fields.map((fieldItem) => (
                    <Box
                      key={fieldItem.fieldId}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.025)',
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 1.5,
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(192, 132, 252, 0.3)',
                        }
                      }}
                    >
                      {/* Breadcrumbs Path */}
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {fieldItem.breadcrumbs.map((crumb, idx) => (
                          <React.Fragment key={idx}>
                            {idx > 0 && <ChevronRightIcon sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 13 }} />}
                            <Chip
                              size="small"
                              label={crumb}
                              sx={{
                                bgcolor: idx === 0
                                  ? 'rgba(124, 58, 237, 0.2)'
                                  : idx === fieldItem.breadcrumbs.length - 1
                                    ? 'rgba(56, 189, 248, 0.15)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                color: idx === 0
                                  ? '#C084FC'
                                  : idx === fieldItem.breadcrumbs.length - 1
                                    ? '#38BDF8'
                                    : '#94A3B8',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                borderRadius: 1,
                                height: 20,
                              }}
                            />
                          </React.Fragment>
                        ))}
                      </Box>

                      {/* Editable Field */}
                      <LeafField
                        key={fieldItem.fieldId}
                        fieldId={fieldItem.fieldId}
                        fieldKey={fieldItem.fieldKey}
                        initialValue={fieldItem.value}
                        path={fieldItem.path}
                        onCommit={handleLeafCommit}
                        onAssetPick={handleAssetPick}
                        detailedPath={fieldItem.detailedPath}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            ))
          )}
        </Box>
      ) : (
        /* ── COMPLETE STANDARD FORM TREE MODE ── */
        <Box>
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
                    borderRadius: 1.5,
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
                        borderRadius: 1.5,
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
                <Box
                  key={key}
                  id={value && typeof value === 'object' && 'content' in value ? `${key}.content` : key}
                  sx={{
                    mb: { xs: 2.5, sm: 4 },
                    background: 'rgba(15, 26, 46, 0.45)',
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    position: 'relative'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#F8FAFC', textTransform: 'capitalize', fontSize: { xs: '1rem', sm: '1.15rem' }, fontWeight: 600 }}>
                      {key}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleSectionRemove(key)}
                      sx={{
                        color: '#94A3B8',
                        borderRadius: 1,
                        '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
                      }}
                      title={`Delete ${key} section`}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ pl: { xs: 1, sm: 2 }, borderLeft: '2px solid rgba(192, 132, 252, 0.3)' }}>
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
        </Box>
      )}

      {/* Asset Selection Modal Dialog */}
      <Dialog
        open={isAssetDialogOpen}
        onClose={() => setIsAssetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2.5,
            m: { xs: 2, sm: 4 },
            maxHeight: '85vh'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', px: { xs: 2, sm: 3 }, py: 2 }}>
          Select an Asset
        </DialogTitle>
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
