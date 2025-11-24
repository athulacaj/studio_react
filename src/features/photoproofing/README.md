# Photo Proofing Feature

## Overview

The Photo Proofing feature allows users to view, organize, and manage photos in albums. Users can browse photos in a grid, view them in fullscreen mode with zoom capabilities, and add/remove photos from different albums.

## Structure

```
photoproofing/
├── components/
│   ├── PhotoGrid/
│   │   ├── PhotoGrid.jsx       # Main grid component
│   │   ├── PhotoCard.jsx       # Individual photo card
│   │   ├── EmptyState.jsx      # Empty album message
│   │   └── index.js
│   ├── FullScreenView/
│   │   ├── FullScreenView.jsx  # Main fullscreen component
│   │   ├── ControlBar.jsx      # Top toolbar
│   │   ├── NavigationButton.jsx# Prev/Next buttons
│   │   ├── ImageViewer.jsx     # Zoom/Pan viewer
│   │   ├── AlbumActionButton.jsx # Add/Remove button
│   │   ├── LikeAnimation.jsx   # Heart animation
│   │   ├── ZoomControls.jsx    # Zoom buttons
│   │   ├── AlbumSelector.jsx   # Album dropdown
│   │   ├── SlideshowControls.jsx # Slideshow controls
│   │   └── index.js
│   └── index.js
├── hooks/
│   ├── useFullscreenControls.js # Fullscreen state
│   ├── useSlideshow.js          # Slideshow logic
│   ├── useImageNavigation.js    # Navigation logic
│   ├── useDoubleClick.js        # Double-click detection
│   └── index.js
├── pages/
│   └── PhotoProofingPage.jsx    # Main page component
└── index.js
```

## Components

### PhotoGrid

Main component that displays photos in a responsive grid layout.

**Props:**
- `albums` (object): Album data with photo indices
- `setAlbums` (function): Update albums state
- `selectedAlbum` (string): Currently selected album

**Features:**
- Responsive grid (1-4 columns based on screen size)
- Hover effects with image zoom
- Like status indicator
- Opens fullscreen view on click

### FullScreenView

Fullscreen photo viewer with advanced controls.

**Props:**
- `images` (array): Array of image URLs
- `currentIndex` (number): Current image index
- `onClose` (function): Close handler
- `onAddToAlbum` (function): Add to album handler
- `onRemoveFromAlbum` (function): Remove from album handler
- `albums` (object): Album data
- `open` (boolean): Dialog open state
- `setCurrentIndex` (function): Update current index

**Features:**
- Image zoom and pan (mouse wheel, pinch gestures)
- Keyboard navigation (arrow keys)
- Slideshow mode with configurable speed
- Album management (add/remove photos)
- Double-click to add to favorites
- Fullscreen mode
- Auto-hiding controls on hover

## Hooks

### useFullscreenControls

Manages fullscreen state and controls visibility.

```javascript
const { isFullscreen, controlsVisible, toggleFullscreen } = useFullscreenControls(isHovering);
```

### useSlideshow

Handles slideshow timing and state.

```javascript
const { slideshowPlaying, slideshowSpeed, setSlideshowSpeed, toggleSlideshow } = useSlideshow(onNext);
```

### useImageNavigation

Provides navigation with keyboard support.

```javascript
const { handleNext, handlePrev } = useImageNavigation(currentIndex, setCurrentIndex, imagesLength, resetZoom);
```

### useDoubleClick

Detects double-click events.

```javascript
const handleClick = useDoubleClick(onDoubleClick);
```

## Usage

### Basic Usage

```javascript
import PhotoProofingPage from './features/photoproofing';

function App() {
  const [albums, setAlbums] = useState({
    favourites: [],
    custom: [],
    recent: []
  });
  const [selectedAlbum, setSelectedAlbum] = useState('all');

  return (
    <PhotoProofingPage 
      albums={albums} 
      setAlbums={setAlbums} 
      selectedAlbum={selectedAlbum} 
    />
  );
}
```

### Using Individual Components

```javascript
import { PhotoGrid, FullScreenView } from './features/photoproofing';

// Use PhotoGrid separately
<PhotoGrid albums={albums} setAlbums={setAlbums} selectedAlbum={selectedAlbum} />

// Use FullScreenView separately
<FullScreenView 
  open={open}
  images={images}
  currentIndex={0}
  onClose={() => setOpen(false)}
  // ... other props
/>
```

## Features

### Photo Grid
- ✅ Responsive grid layout
- ✅ Lazy loading images
- ✅ Hover effects and animations
- ✅ Like status indicators
- ✅ Empty state handling

### Fullscreen Viewer
- ✅ Zoom and pan functionality
- ✅ Keyboard navigation (arrow keys)
- ✅ Mouse wheel zoom
- ✅ Slideshow mode (1s, 3s, 5s intervals)
- ✅ Album management
- ✅ Double-click to favorite
- ✅ Fullscreen mode
- ✅ Auto-hiding controls
- ✅ Like animation feedback

### Album Management
- ✅ Add photos to albums
- ✅ Remove photos from albums
- ✅ Multiple album support
- ✅ Filter by album
- ✅ View all photos

## Dependencies

- `@mui/material` - UI components
- `react-zoom-pan-pinch` - Zoom and pan functionality
- `@mui/icons-material` - Icons

## Future Enhancements

- [ ] Batch selection and operations
- [ ] Photo metadata display
- [ ] Download photos
- [ ] Share photos
- [ ] Custom album creation
- [ ] Photo upload
- [ ] Photo editing tools
- [ ] Comments and annotations
- [ ] Comparison view (side-by-side)
- [ ] Sorting options
