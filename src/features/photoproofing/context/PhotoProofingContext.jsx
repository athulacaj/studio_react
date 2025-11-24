import { createContext, useContext } from 'react';

export const PhotoProofingContext = createContext();

export const usePhotoProofing = () => {
    const context = useContext(PhotoProofingContext);
    if (!context) {
        throw new Error('usePhotoProofing must be used within a PhotoProofingProvider');
    }
    return context;
};
