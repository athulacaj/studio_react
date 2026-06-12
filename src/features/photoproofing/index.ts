// Main page export
export { default } from './pages/PhotoProofingPage';

// Component exports (if needed elsewhere)
export { PhotoGrid, FullScreenView } from './components';

// Zustand store (replaces PhotoProofingProvider + usePhotoProofingcontext)
export { usePhotoProofingStore } from './store/usePhotoProofingStore';
