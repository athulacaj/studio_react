/**
 * A single image to display in the album grid.
 */
export interface AlbumImage {
  id: string;
  url: string;
}

/**
 * Layout config for one grid item.
 * `i` must match an `AlbumImage.id`.
 */
export interface AlbumLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

/**
 * Responsive layouts keyed by breakpoint name.
 * - lg: ≥ 996px  (12 cols)
 * - md: ≥ 768px  (6 cols)   — if not provided, inherits from sm
 * - sm: < 768px  (2 cols)
 */
export interface ResponsiveAlbumLayouts {
  lg?: AlbumLayoutItem[];
  md?: AlbumLayoutItem[];
  sm?: AlbumLayoutItem[];
}

/**
 * View mode for the album editor preview.
 */
export type AlbumViewMode = 'desktop' | 'mobile';

/**
 * Props for the DigitalAlbum component.
 */
export interface DigitalAlbumProps {
  /** List of images to display in the album */
  images: AlbumImage[];

  /**
   * Initial layout configuration.
   * Can be a flat array (applied to all breakpoints) or per-breakpoint layouts.
   * Images not present in the layout are auto-appended as unplaced.
   */
  layout?: AlbumLayoutItem[] | ResponsiveAlbumLayouts;

  /** Number of columns for the large breakpoint (default: 12) */
  cols?: number;

  /** Height of a single row in pixels (default: 120) */
  rowHeight?: number;

  /** Called when the user clicks "Save" with the current layouts */
  onSave?: (layouts: ResponsiveAlbumLayouts) => void;

  /** If true, hides the toolbar and disables drag/resize */
  readOnly?: boolean;
}
