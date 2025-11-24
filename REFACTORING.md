# Component Refactoring Documentation

## Overview
The components have been refactored to improve readability, maintainability, and reusability. The main changes include splitting large components into smaller, focused components and extracting common logic into custom hooks.

## New Structure

### 📁 Directory Structure

```
src/
├── core/
│   ├── components/
│   │   ├── fullscreen/          # Fullscreen view components
│   │   │   ├── ControlBar.jsx
│   │   │   ├── NavigationButton.jsx
│   │   │   ├── ImageViewer.jsx
│   │   │   ├── AlbumActionButton.jsx
│   │   │   ├── LikeAnimation.jsx
│   │   │   ├── ZoomControls.jsx
│   │   │   ├── AlbumSelector.jsx
│   │   │   ├── SlideshowControls.jsx
│   │   │   └── index.js
│   │   ├── grid/                # Photo grid components
│   │   │   ├── PhotoCard.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── index.js
│   │   ├── FullScreenView.jsx   # Main fullscreen component
│   │   └── PhotoGrid.jsx        # Main grid component
│   └── hooks/                   # Custom React hooks
│       ├── useFullscreenControls.js
│       ├── useSlideshow.js
│       ├── useImageNavigation.js
│       ├── useDoubleClick.js
│       └── index.js
```

## Components

### Fullscreen Components

#### **ControlBar**
Top toolbar containing all controls for the fullscreen view.
- **Props**: `controlsVisible`, `onMouseEnter`, `onMouseLeave`, `onClose`, `currentIndex`, `totalImages`, `transformRef`, `selectedAlbum`, `onAlbumChange`, `albums`, `slideshowPlaying`, `onToggleSlideshow`, `slideshowSpeed`, `onSpeedChange`, `isFullscreen`, `onToggleFullscreen`
- **Purpose**: Combines all top controls into a single component

#### **NavigationButton**
Reusable navigation button for prev/next actions.
- **Props**: `onClick`, `icon`, `position` ('left' or 'right')
- **Purpose**: Provides consistent navigation buttons

#### **ImageViewer**
Handles image display with zoom and pan functionality.
- **Props**: `transformRef`, `image`, `imageIndex`, `onImageClick`
- **Purpose**: Encapsulates zoom/pan logic using react-zoom-pan-pinch

#### **AlbumActionButton**
Button for adding/removing images from albums.
- **Props**: `controlsVisible`, `onMouseEnter`, `onMouseLeave`, `isImageInAlbum`, `selectedAlbum`, `onAction`, `slideshowPlaying`
- **Purpose**: Handles album actions with visual feedback

#### **LikeAnimation**
Animated heart icon for like feedback.
- **Props**: `show`
- **Purpose**: Provides visual feedback when adding to favorites

#### **ZoomControls**
Zoom in/out/reset controls.
- **Props**: `transformRef`
- **Purpose**: Provides zoom control buttons

#### **AlbumSelector**
Dropdown for selecting albums.
- **Props**: `selectedAlbum`, `onAlbumChange`, `albums`
- **Purpose**: Allows album selection

#### **SlideshowControls**
Slideshow speed and play/pause controls.
- **Props**: `slideshowPlaying`, `onToggleSlideshow`, `slideshowSpeed`, `onSpeedChange`, `isFullscreen`, `onToggleFullscreen`
- **Purpose**: Controls slideshow functionality

### Grid Components

#### **PhotoCard**
Individual photo card in the grid.
- **Props**: `image`, `index`, `isLiked`, `onOpenFullScreen`
- **Purpose**: Displays a single photo with hover effects

#### **EmptyState**
Empty state message when no photos are available.
- **Props**: `message`
- **Purpose**: Provides user feedback for empty albums

## Custom Hooks

### **useFullscreenControls**
Manages fullscreen state and controls visibility.
- **Parameters**: `isHovering`
- **Returns**: `{ isFullscreen, controlsVisible, toggleFullscreen }`
- **Purpose**: Encapsulates fullscreen logic

### **useSlideshow**
Manages slideshow functionality.
- **Parameters**: `onNext`
- **Returns**: `{ slideshowPlaying, slideshowSpeed, setSlideshowSpeed, toggleSlideshow }`
- **Purpose**: Handles slideshow timing and state

### **useImageNavigation**
Handles image navigation with keyboard support.
- **Parameters**: `currentIndex`, `setCurrentIndex`, `imagesLength`, `resetZoom`
- **Returns**: `{ handleNext, handlePrev }`
- **Purpose**: Provides navigation logic

### **useDoubleClick**
Detects double-click events.
- **Parameters**: `onDoubleClick`
- **Returns**: `handleClick` function
- **Purpose**: Implements double-click detection

## Benefits

### ✅ Improved Readability
- Components are smaller and focused on a single responsibility
- Easier to understand and navigate the codebase

### ✅ Better Maintainability
- Changes to specific features are isolated to their respective components
- Easier to test individual components

### ✅ Reusability
- Common components can be reused across different parts of the application
- Hooks can be shared between components

### ✅ Separation of Concerns
- UI components are separated from business logic
- Custom hooks handle complex state management

## Usage Example

```jsx
import FullScreenView from './core/components/FullScreenView';
import PhotoGrid from './core/components/PhotoGrid';

// Components can be used as before - the API remains the same
<PhotoGrid albums={albums} setAlbums={setAlbums} selectedAlbum={selectedAlbum} />
```

## Migration Notes

- **No breaking changes**: The public API of `FullScreenView` and `PhotoGrid` remains the same
- **Internal structure**: Only the internal implementation has been refactored
- **Imports**: Main components can still be imported from their original locations
