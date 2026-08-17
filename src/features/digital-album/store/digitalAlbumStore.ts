import { create } from 'zustand';
import type { AlbumLayoutItem, AlbumViewMode, ResponsiveAlbumLayouts } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────

/** Deep-clone layouts to prevent reference sharing between undo/redo snapshots. */
const cloneLayouts = (layouts: ResponsiveAlbumLayouts): ResponsiveAlbumLayouts =>
  JSON.parse(JSON.stringify(layouts));

const MAX_HISTORY = 50;

// ─── State ────────────────────────────────────────────────────────────

/** A reserved slot keeps the grid cell after an image is removed */
export interface ReservedSlot {
  /** Unique slot key used in the grid layout (prefixed with __reserved__) */
  slotId: string;
  /** Layout position per breakpoint */
  layouts: ResponsiveAlbumLayouts;
}

export interface DigitalAlbumState {
  /** The active layout for every breakpoint */
  currentLayouts: ResponsiveAlbumLayouts;

  /** Snapshot taken at mount — used for "Reset" */
  initialLayouts: ResponsiveAlbumLayouts;

  /** Last explicitly saved layouts */
  savedLayouts: ResponsiveAlbumLayouts;

  /** Undo stack (most-recent last) */
  undoStack: ResponsiveAlbumLayouts[];

  /** Redo stack (most-recent last) */
  redoStack: ResponsiveAlbumLayouts[];

  /** Desktop or mobile preview */
  viewMode: AlbumViewMode;

  /** True when drag/resize is enabled */
  isEditing: boolean;

  /** IDs of images currently placed on the grid */
  placedImageIds: string[];

  /** Reserved slots — grid cells kept as placeholders after image removal */
  reservedSlots: ReservedSlot[];

  /** True when the grid has been modified since last save */
  hasUnsavedChanges: boolean;

  /** Zoom level (1 = 100%) */
  zoom: number;

  /** True when all items are locked (static) */
  allLocked: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────

export interface DigitalAlbumActions {
  /** Initialise the store with computed layouts. Called once at mount. */
  init: (layouts: ResponsiveAlbumLayouts) => void;

  /**
   * Push the current layout onto the undo stack and apply a new layout.
   * Clears the redo stack.
   */
  updateLayout: (breakpoint: string, layout: AlbumLayoutItem[]) => void;

  /** Undo the last change */
  undo: () => void;

  /** Redo the last undone change */
  redo: () => void;

  /** Reset to the initial layout (clears history) */
  resetLayout: () => void;

  /** Mark layouts as saved */
  saveLayout: () => void;

  /** Switch between desktop / mobile */
  setViewMode: (mode: AlbumViewMode) => void;

  /** Toggle editing mode */
  toggleEditing: () => void;

  /** Set editing mode explicitly */
  setIsEditing: (editing: boolean) => void;

  /** Zoom in */
  zoomIn: () => void;

  /** Zoom out */
  zoomOut: () => void;

  /** Reset zoom to 100 % */
  resetZoom: () => void;

  /** Lock / unlock all items */
  toggleLockAll: () => void;

  /** Compact the grid vertically */
  autoArrange: () => void;

  /** Remove an image from the grid → creates a reserved slot at same position */
  removeFromGrid: (imageId: string) => void;

  /** Add an unplaced image back onto the grid */
  addToGrid: (item: AlbumLayoutItem) => void;

  /** Fill a reserved slot with an image (replaces the placeholder) */
  fillReservedSlot: (slotId: string, imageId: string) => void;

  /** Permanently delete a reserved slot */
  deleteReservedSlot: (slotId: string) => void;

  /** Full reset (for unmount) */
  resetState: () => void;
}

export type DigitalAlbumStore = DigitalAlbumState & DigitalAlbumActions;

// ─── Initial values ───────────────────────────────────────────────────

const emptyLayouts: ResponsiveAlbumLayouts = { lg: [], md: [], sm: [] };

const initialState: DigitalAlbumState = {
  currentLayouts: cloneLayouts(emptyLayouts),
  initialLayouts: cloneLayouts(emptyLayouts),
  savedLayouts: cloneLayouts(emptyLayouts),
  undoStack: [],
  redoStack: [],
  viewMode: 'desktop',
  isEditing: true,
  placedImageIds: [],
  reservedSlots: [],
  hasUnsavedChanges: false,
  zoom: 1,
  allLocked: false,
};

// ─── Store ────────────────────────────────────────────────────────────

export const useDigitalAlbumStore = create<DigitalAlbumStore>((set, get) => ({
  ...initialState,

  // ── Initialise ────────────────────────────────────────────────
  init: (layouts) => {
    const cloned = cloneLayouts(layouts);
    const placedIds = (cloned.lg ?? cloned.md ?? cloned.sm ?? []).map((l) => l.i);
    set({
      currentLayouts: cloneLayouts(layouts),
      initialLayouts: cloneLayouts(layouts),
      savedLayouts: cloneLayouts(layouts),
      placedImageIds: placedIds,
      undoStack: [],
      redoStack: [],
      hasUnsavedChanges: false,
    });
  },

  // ── Layout changes ────────────────────────────────────────────
  updateLayout: (breakpoint, layout) => {
    const { currentLayouts, undoStack } = get();

    // Push current state onto undo stack
    const newUndoStack = [...undoStack, cloneLayouts(currentLayouts)].slice(-MAX_HISTORY);

    const updated: ResponsiveAlbumLayouts = {
      ...currentLayouts,
      [breakpoint]: layout,
    };

    // Extract placed IDs from the updated breakpoint
    const placedIds = layout.map((l) => l.i);

    set({
      currentLayouts: updated,
      undoStack: newUndoStack,
      redoStack: [], // clear redo on new change
      hasUnsavedChanges: true,
      placedImageIds: placedIds,
    });
  },

  // ── Undo / Redo ───────────────────────────────────────────────
  undo: () => {
    const { undoStack, currentLayouts, redoStack } = get();
    if (undoStack.length === 0) return;

    const prev = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);

    const placedIds = (prev.lg ?? prev.md ?? prev.sm ?? []).map((l) => l.i);

    set({
      currentLayouts: prev,
      undoStack: newUndo,
      redoStack: [...redoStack, cloneLayouts(currentLayouts)].slice(-MAX_HISTORY),
      hasUnsavedChanges: true,
      placedImageIds: placedIds,
    });
  },

  redo: () => {
    const { redoStack, currentLayouts, undoStack } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);

    const placedIds = (next.lg ?? next.md ?? next.sm ?? []).map((l) => l.i);

    set({
      currentLayouts: next,
      redoStack: newRedo,
      undoStack: [...undoStack, cloneLayouts(currentLayouts)].slice(-MAX_HISTORY),
      hasUnsavedChanges: true,
      placedImageIds: placedIds,
    });
  },

  // ── Reset ─────────────────────────────────────────────────────
  resetLayout: () => {
    const { initialLayouts, currentLayouts, undoStack } = get();
    const placedIds = (initialLayouts.lg ?? initialLayouts.md ?? initialLayouts.sm ?? []).map(
      (l) => l.i,
    );

    set({
      currentLayouts: cloneLayouts(initialLayouts),
      undoStack: [...undoStack, cloneLayouts(currentLayouts)].slice(-MAX_HISTORY),
      redoStack: [],
      hasUnsavedChanges: true,
      placedImageIds: placedIds,
    });
  },

  // ── Save ──────────────────────────────────────────────────────
  saveLayout: () => {
    const { currentLayouts } = get();
    set({
      savedLayouts: cloneLayouts(currentLayouts),
      hasUnsavedChanges: false,
    });
  },

  // ── View mode ─────────────────────────────────────────────────
  setViewMode: (viewMode) => set({ viewMode }),

  // ── Editing ───────────────────────────────────────────────────
  toggleEditing: () => set((s) => ({ isEditing: !s.isEditing })),
  setIsEditing: (isEditing) => set({ isEditing }),

  // ── Zoom ──────────────────────────────────────────────────────
  zoomIn: () => set((s) => ({ zoom: Math.min(s.zoom + 0.1, 2) })),
  zoomOut: () => set((s) => ({ zoom: Math.max(s.zoom - 0.1, 0.4) })),
  resetZoom: () => set({ zoom: 1 }),

  // ── Lock all ──────────────────────────────────────────────────
  toggleLockAll: () => {
    const { allLocked, currentLayouts } = get();
    const newLocked = !allLocked;

    const lockLayout = (items?: AlbumLayoutItem[]) =>
      items?.map((item) => ({ ...item, static: newLocked }));

    set({
      allLocked: newLocked,
      currentLayouts: {
        lg: lockLayout(currentLayouts.lg),
        md: lockLayout(currentLayouts.md),
        sm: lockLayout(currentLayouts.sm),
      },
    });
  },

  // ── Auto-arrange ──────────────────────────────────────────────
  autoArrange: () => {
    const { currentLayouts, undoStack } = get();
    const newUndoStack = [...undoStack, cloneLayouts(currentLayouts)].slice(-MAX_HISTORY);

    /** Simple vertical compaction */
    const compact = (items?: AlbumLayoutItem[], cols = 12): AlbumLayoutItem[] => {
      if (!items || items.length === 0) return [];

      const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
      const occupied: boolean[][] = [];

      const isOccupied = (x: number, y: number) => occupied[y]?.[x] ?? false;

      const markOccupied = (item: AlbumLayoutItem) => {
        for (let row = item.y; row < item.y + item.h; row++) {
          if (!occupied[row]) occupied[row] = [];
          for (let col = item.x; col < item.x + item.w; col++) {
            occupied[row][col] = true;
          }
        }
      };

      const findPosition = (w: number, h: number): { x: number; y: number } => {
        for (let y = 0; ; y++) {
          for (let x = 0; x <= cols - w; x++) {
            let fits = true;
            for (let row = y; row < y + h && fits; row++) {
              for (let col = x; col < x + w && fits; col++) {
                if (isOccupied(col, row)) fits = false;
              }
            }
            if (fits) return { x, y };
          }
        }
      };

      return sorted.map((item) => {
        const pos = findPosition(item.w, item.h);
        const compacted = { ...item, x: pos.x, y: pos.y };
        markOccupied(compacted);
        return compacted;
      });
    };

    set({
      currentLayouts: {
        lg: compact(currentLayouts.lg, 12),
        md: compact(currentLayouts.md, 6),
        sm: compact(currentLayouts.sm, 2),
      },
      undoStack: newUndoStack,
      redoStack: [],
      hasUnsavedChanges: true,
    });
  },

  // ── Remove from grid → create reserved slot ───────────────────
  removeFromGrid: (imageId) => {
    const { currentLayouts, undoStack, placedImageIds, reservedSlots } = get();
    const newUndoStack = [...undoStack, cloneLayouts(currentLayouts)].slice(-MAX_HISTORY);

    // Capture the layout item's position before removing it
    const slotId = `__reserved__${Date.now()}_${imageId}`;
    const findItem = (items?: AlbumLayoutItem[]) => items?.find((it) => it.i === imageId);

    const lgItem = findItem(currentLayouts.lg);
    const mdItem = findItem(currentLayouts.md);
    const smItem = findItem(currentLayouts.sm);

    // Build the reserved slot with the same position/size
    const newSlot: ReservedSlot = {
      slotId,
      layouts: {
        lg: lgItem ? [{ ...lgItem, i: slotId }] : [],
        md: mdItem ? [{ ...mdItem, i: slotId }] : [],
        sm: smItem ? [{ ...smItem, i: slotId }] : [],
      },
    };

    // Replace the image's layout item with the reserved slot's layout item
    const replaceWithSlot = (items?: AlbumLayoutItem[], slotItem?: AlbumLayoutItem[]) => {
      if (!items) return slotItem ?? [];
      const filtered = items.filter((it) => it.i !== imageId);
      return slotItem && slotItem.length > 0 ? [...filtered, slotItem[0]] : filtered;
    };

    set({
      currentLayouts: {
        lg: replaceWithSlot(currentLayouts.lg, newSlot.layouts.lg),
        md: replaceWithSlot(currentLayouts.md, newSlot.layouts.md),
        sm: replaceWithSlot(currentLayouts.sm, newSlot.layouts.sm),
      },
      undoStack: newUndoStack,
      redoStack: [],
      placedImageIds: placedImageIds.filter((id) => id !== imageId),
      reservedSlots: [...reservedSlots, newSlot],
      hasUnsavedChanges: true,
    });
  },

  // ── Fill reserved slot with an image ──────────────────────────
  fillReservedSlot: (slotId, imageId) => {
    const { currentLayouts, undoStack, placedImageIds, reservedSlots } = get();
    const newUndoStack = [...undoStack, cloneLayouts(currentLayouts)].slice(-MAX_HISTORY);

    // Replace the slot's layout key with the image's id
    const replaceKey = (items?: AlbumLayoutItem[]) =>
      items?.map((it) => (it.i === slotId ? { ...it, i: imageId } : it));

    set({
      currentLayouts: {
        lg: replaceKey(currentLayouts.lg),
        md: replaceKey(currentLayouts.md),
        sm: replaceKey(currentLayouts.sm),
      },
      undoStack: newUndoStack,
      redoStack: [],
      placedImageIds: [...placedImageIds, imageId],
      reservedSlots: reservedSlots.filter((s) => s.slotId !== slotId),
      hasUnsavedChanges: true,
    });
  },

  // ── Delete reserved slot permanently ──────────────────────────
  deleteReservedSlot: (slotId) => {
    const { currentLayouts, undoStack, reservedSlots } = get();
    const newUndoStack = [...undoStack, cloneLayouts(currentLayouts)].slice(-MAX_HISTORY);

    const remove = (items?: AlbumLayoutItem[]) => items?.filter((it) => it.i !== slotId);

    set({
      currentLayouts: {
        lg: remove(currentLayouts.lg),
        md: remove(currentLayouts.md),
        sm: remove(currentLayouts.sm),
      },
      undoStack: newUndoStack,
      redoStack: [],
      reservedSlots: reservedSlots.filter((s) => s.slotId !== slotId),
      hasUnsavedChanges: true,
    });
  },

  // ── Add to grid ───────────────────────────────────────────────
  addToGrid: (item) => {
    const { currentLayouts, undoStack, placedImageIds } = get();
    const newUndoStack = [...undoStack, cloneLayouts(currentLayouts)].slice(-MAX_HISTORY);

    /** Compute the bottom Y for a given layout */
    const bottomY = (items?: AlbumLayoutItem[]) =>
      items && items.length > 0 ? Math.max(...items.map((it) => it.y + it.h)) : 0;

    const lgY = bottomY(currentLayouts.lg);
    const mdY = bottomY(currentLayouts.md);
    const smY = bottomY(currentLayouts.sm);

    set({
      currentLayouts: {
        lg: [...(currentLayouts.lg ?? []), { ...item, x: 0, y: lgY, w: 3, h: 2 }],
        md: [...(currentLayouts.md ?? []), { ...item, x: 0, y: mdY, w: 3, h: 2 }],
        sm: [...(currentLayouts.sm ?? []), { ...item, x: 0, y: smY, w: 2, h: 2 }],
      },
      undoStack: newUndoStack,
      redoStack: [],
      placedImageIds: [...placedImageIds, item.i],
      hasUnsavedChanges: true,
    });
  },

  // ── Full reset ────────────────────────────────────────────────
  resetState: () => set(initialState),
}));
