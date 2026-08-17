import { useEffect, useMemo } from 'react';

import AlbumToolbar from './AlbumToolbar';
import AlbumGrid from './AlbumGrid';
import { useDigitalAlbumStore } from '../store/digitalAlbumStore';

import type {
  AlbumImage,
  AlbumLayoutItem,
  DigitalAlbumProps,
  ResponsiveAlbumLayouts,
} from '../types';

import './DigitalAlbum.css';

/**
 * Resolve user-supplied layout (flat array or per-breakpoint) into a
 * full `ResponsiveAlbumLayouts` object, auto-appending any images
 * missing from the config at the bottom of the grid.
 */
function resolveLayouts(
  images: AlbumImage[],
  layout: AlbumLayoutItem[] | ResponsiveAlbumLayouts | undefined,
  cols: number,
): ResponsiveAlbumLayouts {
  // Normalise into per-breakpoint
  let base: ResponsiveAlbumLayouts;

  if (!layout) {
    base = { lg: [], md: [], sm: [] };
  } else if (Array.isArray(layout)) {
    // Flat array → apply to lg; derive md & sm with clamped widths
    base = {
      lg: layout,
      md: layout.map((item) => ({
        ...item,
        w: Math.min(item.w, Math.max(Math.floor(cols / 2), 2)),
      })),
      sm: layout.map((item) => ({ ...item, w: Math.min(item.w, 2) })),
    };
  } else {
    base = {
      lg: layout.lg ?? [],
      md: layout.md ?? [],
      sm: layout.sm ?? [],
    };
  }

  // If md is empty, inherit from sm
  if (base.md!.length === 0 && base.sm!.length > 0) {
    base.md = base.sm!.map((item) => ({ ...item }));
  }

  // Identify images missing from the lg layout (or primary breakpoint)
  const lgIds = new Set((base.lg ?? []).map((item) => item.i));
  const missingImages = images.filter((img) => !lgIds.has(img.id));

  if (missingImages.length > 0) {
    // Compute the bottom-Y of the existing layout
    const bottomY = (items: AlbumLayoutItem[]) =>
      items.length > 0 ? Math.max(...items.map((it) => it.y + it.h)) : 0;

    let lgY = bottomY(base.lg ?? []);
    let mdY = bottomY(base.md ?? []);
    let smY = bottomY(base.sm ?? []);

    missingImages.forEach((img) => {
      // Append with default sizing
      base.lg!.push({ i: img.id, x: 0, y: lgY, w: 3, h: 2 });
      base.md!.push({ i: img.id, x: 0, y: mdY, w: 3, h: 2 });
      base.sm!.push({ i: img.id, x: 0, y: smY, w: 2, h: 2 });
      lgY += 2;
      mdY += 2;
      smY += 2;
    });
  }

  return base;
}

/**
 * # DigitalAlbum
 *
 * A self-contained, draggable image grid editor.
 *
 * ## Usage
 * ```tsx
 * <DigitalAlbum
 *   images={[{ id: '1', url: '/photo1.jpg' }, { id: '2', url: '/photo2.jpg' }]}
 *   layout={[{ i: '1', x: 0, y: 0, w: 4, h: 3 }]}
 *   onSave={(layouts) => console.log('Saved:', layouts)}
 * />
 * ```
 */
export default function DigitalAlbum({
  images,
  layout,
  cols = 12,
  rowHeight = 120,
  onSave,
  readOnly = false,
}: DigitalAlbumProps) {
  const { init, resetState, setIsEditing } = useDigitalAlbumStore();

  // Compute resolved layouts only once on mount (or when images/layout change)
  const resolvedLayouts = useMemo(
    () => resolveLayouts(images, layout, cols),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images.length, JSON.stringify(layout), cols],
  );

  // Initialise store
  useEffect(() => {
    init(resolvedLayouts);

    if (readOnly) {
      setIsEditing(false);
    }

    return () => {
      resetState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedLayouts, readOnly]);

  return (
    <div className="digital-album-root">
      {!readOnly && <AlbumToolbar images={images} onSave={onSave} />}
      <AlbumGrid images={images} cols={cols} rowHeight={rowHeight} />
    </div>
  );
}
