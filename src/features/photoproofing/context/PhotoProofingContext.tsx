import { createContext, useContext } from 'react';
import { PhotoProofingContextType } from '../types';





export const PhotoProofingContext = createContext<PhotoProofingContextType | null>(null);

export const usePhotoProofingcontext = () => {
    const context: PhotoProofingContextType | null = useContext(PhotoProofingContext);
    if (!context) {
        throw new Error('usePhotoProofing must be used within a PhotoProofingProvider');
    }
    return context;
};
