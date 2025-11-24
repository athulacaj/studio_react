# Quick Reference Guide

## 🎯 Component Quick Reference

### Fullscreen Components

#### ControlBar
```jsx
<ControlBar
  controlsVisible={boolean}
  onMouseEnter={() => {}}
  onMouseLeave={() => {}}
  onClose={() => {}}
  currentIndex={number}
  totalImages={number}
  transformRef={ref}
  selectedAlbum={string}
  onAlbumChange={(album) => {}}
  albums={object}
  slideshowPlaying={boolean}
  onToggleSlideshow={() => {}}
  slideshowSpeed={number}
  onSpeedChange={(speed) => {}}
  isFullscreen={boolean}
  onToggleFullscreen={() => {}}
/>
```

#### NavigationButton
```jsx
<NavigationButton
  onClick={() => {}}
  icon={IconComponent}
  position="left" // or "right"
/>
```

#### ImageViewer
```jsx
<ImageViewer
  transformRef={ref}
  image={string}
  imageIndex={number}
  onImageClick={(e) => {}}
/>
```

#### AlbumActionButton
```jsx
<AlbumActionButton
  controlsVisible={boolean}
  onMouseEnter={() => {}}
  onMouseLeave={() => {}}
  isImageInAlbum={boolean}
  selectedAlbum={string}
  onAction={() => {}}
  slideshowPlaying={boolean}
/>
```

#### ZoomControls
```jsx
<ZoomControls transformRef={ref} />
```

#### AlbumSelector
```jsx
<AlbumSelector
  selectedAlbum={string}
  onAlbumChange={(album) => {}}
  albums={object}
/>
```

#### SlideshowControls
```jsx
<SlideshowControls
  slideshowPlaying={boolean}
  onToggleSlideshow={() => {}}
  slideshowSpeed={number}
  onSpeedChange={(speed) => {}}
  isFullscreen={boolean}
  onToggleFullscreen={() => {}}
/>
```

#### LikeAnimation
```jsx
<LikeAnimation show={boolean} />
```

### Grid Components

#### PhotoCard
```jsx
<PhotoCard
  image={string}
  index={number}
  isLiked={boolean}
  onOpenFullScreen={(index) => {}}
/>
```

#### EmptyState
```jsx
<EmptyState message="Custom message" />
```

## 🪝 Custom Hooks Reference

### useFullscreenControls
```jsx
const { isFullscreen, controlsVisible, toggleFullscreen } = useFullscreenControls(isHovering);
```

**Parameters:**
- `isHovering` (boolean): Whether mouse is hovering over controls area

**Returns:**
- `isFullscreen` (boolean): Current fullscreen state
- `controlsVisible` (boolean): Whether controls should be visible
- `toggleFullscreen` (function): Toggle fullscreen mode

### useSlideshow
```jsx
const { slideshowPlaying, slideshowSpeed, setSlideshowSpeed, toggleSlideshow } = useSlideshow(onNext);
```

**Parameters:**
- `onNext` (function): Callback to advance to next image

**Returns:**
- `slideshowPlaying` (boolean): Whether slideshow is active
- `slideshowSpeed` (number): Current speed in milliseconds
- `setSlideshowSpeed` (function): Update slideshow speed
- `toggleSlideshow` (function): Start/stop slideshow

### useImageNavigation
```jsx
const { handleNext, handlePrev } = useImageNavigation(
  currentIndex,
  setCurrentIndex,
  imagesLength,
  resetZoom
);
```

**Parameters:**
- `currentIndex` (number): Current image index
- `setCurrentIndex` (function): Update current index
- `imagesLength` (number): Total number of images
- `resetZoom` (function): Reset zoom level

**Returns:**
- `handleNext` (function): Navigate to next image
- `handlePrev` (function): Navigate to previous image

### useDoubleClick
```jsx
const handleClick = useDoubleClick(onDoubleClick);
```

**Parameters:**
- `onDoubleClick` (function): Callback for double-click event

**Returns:**
- `handleClick` (function): Click handler to attach to element

## 📦 Import Examples

### Import Main Components
```jsx
import FullScreenView from './core/components/FullScreenView';
import PhotoGrid from './core/components/PhotoGrid';
```

### Import Fullscreen Components
```jsx
import { 
  ControlBar, 
  NavigationButton, 
  ImageViewer,
  AlbumActionButton,
  ZoomControls,
  AlbumSelector,
  SlideshowControls,
  LikeAnimation
} from './core/components/fullscreen';
```

### Import Grid Components
```jsx
import { PhotoCard, EmptyState } from './core/components/grid';
```

### Import Hooks
```jsx
import {
  useFullscreenControls,
  useSlideshow,
  useImageNavigation,
  useDoubleClick
} from './core/hooks';
```

## 🎨 Common Patterns

### Creating a Custom Navigation Button
```jsx
import NavigationButton from './core/components/fullscreen/NavigationButton';
import CustomIcon from '@mui/icons-material/Custom';

<NavigationButton
  onClick={handleCustomAction}
  icon={CustomIcon}
  position="left"
/>
```

### Using Hooks Together
```jsx
const [isHovering, setIsHovering] = useState(false);
const { isFullscreen, controlsVisible, toggleFullscreen } = useFullscreenControls(isHovering);
const { handleNext, handlePrev } = useImageNavigation(currentIndex, setCurrentIndex, images.length, resetZoom);
const { slideshowPlaying, toggleSlideshow } = useSlideshow(handleNext);
```

### Customizing PhotoCard
```jsx
import PhotoCard from './core/components/grid/PhotoCard';

<PhotoCard
  image="https://example.com/image.jpg"
  index={0}
  isLiked={true}
  onOpenFullScreen={(index) => console.log('Opening image', index)}
/>
```

## 🔧 Customization Tips

### Styling Components
All components use MUI's `sx` prop for styling. You can override styles by passing custom `sx` props:

```jsx
// Example: Custom styled NavigationButton
<NavigationButton
  onClick={handleNext}
  icon={ArrowIcon}
  position="right"
  sx={{
    backgroundColor: 'custom.color',
    '&:hover': { backgroundColor: 'custom.hoverColor' }
  }}
/>
```

### Extending Hooks
You can extend hooks by wrapping them:

```jsx
const useCustomSlideshow = (onNext, initialSpeed = 5000) => {
  const slideshow = useSlideshow(onNext);
  
  useEffect(() => {
    slideshow.setSlideshowSpeed(initialSpeed);
  }, []);
  
  return slideshow;
};
```

## 📝 Best Practices

1. **Always use the hooks** - They encapsulate complex logic
2. **Keep components pure** - Pass data through props
3. **Use index files** - Import from `./fullscreen` instead of individual files
4. **Maintain prop types** - Document expected props
5. **Handle edge cases** - Check for null/undefined values

## 🐛 Troubleshooting

### Controls not showing
- Check `controlsVisible` state
- Verify `isHovering` is being set correctly
- Ensure `useFullscreenControls` hook is called

### Zoom not working
- Verify `transformRef` is passed correctly
- Check that `react-zoom-pan-pinch` is installed
- Ensure `resetZoom` is called on image change

### Slideshow not advancing
- Check `slideshowPlaying` state
- Verify `onNext` callback is provided
- Ensure `slideshowSpeed` is a valid number

### Double-click not detected
- Verify `useDoubleClick` hook is used
- Check click handler is attached to correct element
- Ensure `onDoubleClick` callback is provided
