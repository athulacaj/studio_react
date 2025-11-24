# Component Architecture

## Component Hierarchy

```
FullScreenView (Main Container)
├── Dialog (MUI)
│   └── Box (Container)
│       ├── Box (Hover Detection Area)
│       ├── ControlBar
│       │   ├── AppBar
│       │   │   └── Toolbar
│       │   │       ├── Close Button & Counter
│       │   │       └── Controls Group
│       │   │           ├── ZoomControls
│       │   │           │   ├── Zoom In Button
│       │   │           │   ├── Zoom Out Button
│       │   │           │   └── Reset Button
│       │   │           ├── Divider
│       │   │           ├── AlbumSelector
│       │   │           │   └── Select Dropdown
│       │   │           └── SlideshowControls
│       │   │               ├── Speed Selector
│       │   │               ├── Play/Pause Button
│       │   │               └── Fullscreen Button
│       ├── Box (Main Image Area)
│       │   ├── LikeAnimation
│       │   ├── NavigationButton (Previous)
│       │   ├── ImageViewer
│       │   │   └── TransformWrapper
│       │   │       └── TransformComponent
│       │   │           └── Image
│       │   └── NavigationButton (Next)
│       └── AlbumActionButton
│           └── Button (Add/Remove from Album)

PhotoGrid (Main Container)
├── Box (Grid Container)
│   ├── PhotoCard (x N)
│   │   └── Card
│   │       └── Box
│   │           ├── CardMedia (Image)
│   │           ├── Box (Overlay)
│   │           │   └── "View" Button
│   │           └── Box (Info Bar)
│   │               ├── Image Name
│   │               └── Like Badge
│   └── EmptyState (if no photos)
└── FullScreenView
```

## Data Flow

```
PhotoGrid
    ↓ (user clicks photo)
    ↓ handleOpenFullScreen(index)
    ↓
FullScreenView
    ↓ (user interacts)
    ↓
Custom Hooks
    ├── useFullscreenControls → manages fullscreen state
    ├── useSlideshow → manages slideshow timing
    ├── useImageNavigation → handles prev/next
    └── useDoubleClick → detects double-click
    ↓
Child Components
    ├── ControlBar → displays all controls
    ├── ImageViewer → shows image with zoom
    ├── NavigationButton → prev/next buttons
    ├── AlbumActionButton → add/remove actions
    └── LikeAnimation → visual feedback
    ↓
State Updates
    ↓ onAddToAlbum / onRemoveFromAlbum
    ↓
PhotoGrid (albums state updated)
```

## State Management

### PhotoGrid State
- `fullScreenOpen`: Boolean - controls fullscreen dialog
- `currentIndex`: Number - current image index
- `albums`: Object - album data
- `selectedAlbum`: String - currently selected album

### FullScreenView State
- `selectedAlbum`: String - selected album for actions
- `showLikeAnimation`: Boolean - shows/hides like animation
- `isHovering`: Boolean - tracks mouse hover state

### Custom Hooks State
- **useFullscreenControls**
  - `isFullscreen`: Boolean
  - `controlsVisible`: Boolean
  
- **useSlideshow**
  - `slideshowPlaying`: Boolean
  - `slideshowSpeed`: Number (ms)
  
- **useImageNavigation**
  - Manages navigation logic
  
- **useDoubleClick**
  - Manages click timer

## Props Flow

```
App/Page
    ↓ albums, setAlbums, selectedAlbum
PhotoGrid
    ↓ images, currentIndex, onClose, onAddToAlbum, onRemoveFromAlbum, albums, open, setCurrentIndex
FullScreenView
    ↓ (distributed to child components)
    ├── ControlBar
    │   ├── controlsVisible, onMouseEnter, onMouseLeave
    │   ├── onClose, currentIndex, totalImages
    │   ├── transformRef
    │   ├── selectedAlbum, onAlbumChange, albums
    │   └── slideshow & fullscreen props
    ├── NavigationButton
    │   ├── onClick
    │   ├── icon
    │   └── position
    ├── ImageViewer
    │   ├── transformRef
    │   ├── image, imageIndex
    │   └── onImageClick
    └── AlbumActionButton
        ├── controlsVisible, onMouseEnter, onMouseLeave
        ├── isImageInAlbum, selectedAlbum
        ├── onAction
        └── slideshowPlaying
```

## File Size Comparison

### Before Refactoring
- `FullScreenView.jsx`: ~15,864 bytes (461 lines)
- `PhotoGrid.jsx`: ~7,276 bytes (202 lines)

### After Refactoring
- `FullScreenView.jsx`: ~5,587 bytes (185 lines) ✅ 65% reduction
- `PhotoGrid.jsx`: ~2,569 bytes (87 lines) ✅ 65% reduction
- **New Components**: 8 focused components
- **New Hooks**: 4 reusable hooks

## Benefits Summary

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be used in other parts of the app
3. **Testability**: Smaller components are easier to test
4. **Maintainability**: Changes are isolated to specific files
5. **Readability**: Code is easier to understand and navigate
6. **Performance**: Potential for better memoization and optimization
