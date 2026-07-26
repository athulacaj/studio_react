import { create } from 'zustand';

interface PortfolioState {
    htmlContent: string;
    portfolioData: any;
    uploadedImages: { id: string; file?: File; url: string; compressed: boolean; fileKey?: string }[];
    setHtmlContent: (html: string) => void;
    setPortfolioData: (data: any) => void;
    setUploadedImages: (images: { id: string; file?: File; url: string; compressed: boolean; fileKey?: string }[]) => void;
    addUploadedImages: (images: { id: string; file?: File; url: string; compressed: boolean; fileKey?: string }[]) => void;
    removeUploadedImage: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
    htmlContent: '',
    portfolioData: null,
    uploadedImages: [],
    setHtmlContent: (htmlContent) => set({ htmlContent }),
    setPortfolioData: (portfolioData) => set({ portfolioData }),
    setUploadedImages: (images) => set({ uploadedImages: images }),
    addUploadedImages: (images) => set((state) => ({ uploadedImages: [...state.uploadedImages, ...images] })),
    removeUploadedImage: (id) => set((state) => ({
        uploadedImages: state.uploadedImages.filter((img) => img.id !== id)
    })),
}));
