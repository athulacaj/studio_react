import { IconButton, Tooltip, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import MonitorIcon from '@mui/icons-material/Monitor';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';

import { useDigitalAlbumStore } from '../store/digitalAlbumStore';
import UnplacedImagesTray from './UnplacedImagesTray';
import type { AlbumImage, ResponsiveAlbumLayouts } from '../types';

interface AlbumToolbarProps {
  images: AlbumImage[];
  onSave?: (layouts: ResponsiveAlbumLayouts) => void;
}

export default function AlbumToolbar({ images, onSave }: AlbumToolbarProps) {
  const {
    isEditing,
    toggleEditing,
    undoStack,
    redoStack,
    undo,
    redo,
    resetLayout,
    saveLayout,
    currentLayouts,
    viewMode,
    setViewMode,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    allLocked,
    toggleLockAll,
    autoArrange,
    hasUnsavedChanges,
  } = useDigitalAlbumStore();

  const handleSave = () => {
    saveLayout();
    onSave?.(currentLayouts);
  };

  return (
    <div className="album-toolbar" role="toolbar" aria-label="Album editor controls">
      {/* ── Edit / Preview ──────────────────────────────────── */}
      <div className="toolbar-section">
        <Tooltip title={isEditing ? 'Switch to preview' : 'Switch to edit'} arrow>
          <IconButton
            size="small"
            onClick={toggleEditing}
            sx={{
              color: isEditing ? '#A855F7' : 'rgba(148,163,184,0.7)',
            }}
          >
            {isEditing ? <EditIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </div>

      <div className="toolbar-divider" />

      {/* ── Undo / Redo ─────────────────────────────────────── */}
      <div className="toolbar-section">
        <Tooltip title="Undo" arrow>
          <span>
            <IconButton
              size="small"
              onClick={undo}
              disabled={undoStack.length === 0}
              sx={{ color: 'rgba(148,163,184,0.7)', '&:disabled': { color: 'rgba(148,163,184,0.25)' } }}
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo" arrow>
          <span>
            <IconButton
              size="small"
              onClick={redo}
              disabled={redoStack.length === 0}
              sx={{ color: 'rgba(148,163,184,0.7)', '&:disabled': { color: 'rgba(148,163,184,0.25)' } }}
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </div>

      <div className="toolbar-divider" />

      {/* ── Grid Controls ───────────────────────────────────── */}
      <div className="toolbar-section">
        <Tooltip title="Reset to initial layout" arrow>
          <IconButton
            size="small"
            onClick={resetLayout}
            sx={{ color: 'rgba(148,163,184,0.7)' }}
          >
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Auto-arrange (compact)" arrow>
          <IconButton
            size="small"
            onClick={autoArrange}
            sx={{ color: 'rgba(148,163,184,0.7)' }}
          >
            <AutoFixHighIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={allLocked ? 'Unlock all items' : 'Lock all items'} arrow>
          <IconButton
            size="small"
            onClick={toggleLockAll}
            sx={{ color: allLocked ? '#F59E0B' : 'rgba(148,163,184,0.7)' }}
          >
            {allLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </div>

      <div className="toolbar-divider" />

      {/* ── Add Images ──────────────────────────────────────── */}
      <div className="toolbar-section">
        <UnplacedImagesTray images={images} />
      </div>

      <div className="toolbar-divider" />

      {/* ── View Mode ───────────────────────────────────────── */}
      <div className="toolbar-section">
        <Tooltip title="Desktop view" arrow>
          <IconButton
            size="small"
            onClick={() => setViewMode('desktop')}
            sx={{
              color: viewMode === 'desktop' ? '#A855F7' : 'rgba(148,163,184,0.7)',
            }}
          >
            <MonitorIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Mobile view" arrow>
          <IconButton
            size="small"
            onClick={() => setViewMode('mobile')}
            sx={{
              color: viewMode === 'mobile' ? '#A855F7' : 'rgba(148,163,184,0.7)',
            }}
          >
            <PhoneIphoneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      <div className="toolbar-divider" />

      {/* ── Zoom ────────────────────────────────────────────── */}
      <div className="toolbar-section">
        <Tooltip title="Zoom out" arrow>
          <span>
            <IconButton
              size="small"
              onClick={zoomOut}
              disabled={zoom <= 0.4}
              sx={{ color: 'rgba(148,163,184,0.7)', '&:disabled': { color: 'rgba(148,163,184,0.25)' } }}
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Reset zoom" arrow>
          <IconButton size="small" onClick={resetZoom} sx={{ p: 0 }}>
            <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom in" arrow>
          <span>
            <IconButton
              size="small"
              onClick={zoomIn}
              disabled={zoom >= 2}
              sx={{ color: 'rgba(148,163,184,0.7)', '&:disabled': { color: 'rgba(148,163,184,0.25)' } }}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Fit to view" arrow>
          <IconButton
            size="small"
            onClick={resetZoom}
            sx={{ color: 'rgba(148,163,184,0.7)' }}
          >
            <CenterFocusStrongIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* ── Spacer ──────────────────────────────────────────── */}
      <div className="toolbar-spacer" />

      {/* ── Unsaved indicator + Save ────────────────────────── */}
      <div className="toolbar-section">
        {hasUnsavedChanges && (
          <Chip
            label="Unsaved"
            size="small"
            className="unsaved-chip"
            sx={{
              bgcolor: 'rgba(245, 158, 11, 0.15)',
              color: '#F59E0B',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
              mr: 0.5,
            }}
          />
        )}

        <Tooltip title="Save changes" arrow>
          <span>
            <IconButton
              size="small"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              sx={{
                color: hasUnsavedChanges ? '#22C55E' : 'rgba(148,163,184,0.25)',
                '&:hover': { background: 'rgba(34, 197, 94, 0.1)' },
              }}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
