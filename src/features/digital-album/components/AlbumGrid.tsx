import { useMemo, useRef, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import type { Layout } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import AlbumGridItem from './AlbumGridItem';
import ReservedSlot from './ReservedSlot';
import { useDigitalAlbumStore } from '../store/digitalAlbumStore';
import type { AlbumImage, AlbumLayoutItem } from '../types';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface AlbumGridProps {
  images: AlbumImage[];
  cols?: number;
  rowHeight?: number;
}

/** Column config per breakpoint */
const getColsConfig = (baseCols: number) => ({
  lg: baseCols,
  md: Math.max(Math.floor(baseCols / 2), 2),
  sm: 2,
});

/** Breakpoint widths */
const BREAKPOINTS = { lg: 996, md: 768, sm: 0 };

export default function AlbumGrid({ images, cols = 12, rowHeight = 120 }: AlbumGridProps) {
  const {
    currentLayouts,
    isEditing,
    viewMode,
    zoom,
    placedImageIds,
    reservedSlots,
    updateLayout,
    removeFromGrid,
  } = useDigitalAlbumStore();

  const colsConfig = useMemo(() => getColsConfig(cols), [cols]);


  // Only render images that are placed on the grid
  const placedImages = useMemo(
    () => images.filter((img) => placedImageIds.includes(img.id)),
    [images, placedImageIds],
  );

  // Build the layouts object for Responsive component
  const layouts = useMemo(() => {
    // If md layout is empty but sm has items, copy sm to md
    const lgLayout = currentLayouts.lg ?? [];
    let mdLayout = currentLayouts.md ?? [];
    const smLayout = currentLayouts.sm ?? [];

    if (mdLayout.length === 0 && smLayout.length > 0) {
      mdLayout = smLayout.map((item) => ({ ...item }));
    }

    return { lg: lgLayout, md: mdLayout, sm: smLayout };
  }, [currentLayouts]);

  // Track the active breakpoint to only update the one being interacted with
  const activeBreakpoint = useRef<string>('lg');

  const handleBreakpointChange = useCallback((newBreakpoint: string) => {
    activeBreakpoint.current = newBreakpoint;
  }, []);

  const handleLayoutChange = useCallback(
    (_currentLayout: Layout, allLayouts: Partial<Record<string, Layout>>) => {
      // Only update the active breakpoint to prevent cascading re-layouts
      const bp = activeBreakpoint.current;
      const layout = allLayouts[bp];
      if (layout) {
        updateLayout(bp, [...layout] as unknown as AlbumLayoutItem[]);
      }
    },
    [updateLayout],
  );

  if (placedImages.length === 0 && reservedSlots.length === 0) {
    return (
      <div className="album-empty-state">
        <span style={{ fontSize: '3rem', opacity: 0.3 }}>📷</span>
        <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.9rem' }}>
          No images on the grid. Use the "Add Images" button to place images.
        </span>
      </div>
    );
  }

  return (
    <div
      className={`digital-album-grid-wrapper ${viewMode === 'mobile' ? 'mobile-view' : ''}`}
      style={{ transform: `scale(${zoom})` }}
    >
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={colsConfig}
        rowHeight={rowHeight}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={handleBreakpointChange}
        useCSSTransforms
        compactType="vertical"
        preventCollision={false}
      >
        {placedImages.map((img) => (
          <div key={img.id} style={{ width: '100%', height: '100%' }}>
            <AlbumGridItem
              imageUrl={img.url}
              imageId={img.id}
              isEditing={isEditing}
              onRemove={isEditing ? removeFromGrid : undefined}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ))}
        {isEditing && reservedSlots.map((slot) => (
          <div key={slot.slotId} style={{ width: '100%', height: '100%' }}>
            <ReservedSlot slotId={slot.slotId} images={images} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
