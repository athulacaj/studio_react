import { create } from 'zustand';
import { Business } from '../api/businessService';
import { Website, WebsitePath } from '../api/WebsiteService';

interface PortfolioState {
    htmlContent: string;
    portfolioData: any;
    businessData: Business | null;
    webSiteData: Website | null,
    pathData: WebsitePath | null,
    uploadedImages: { id: string; file?: File; url: string; compressed: boolean; fileKey?: string }[];
    setHtmlContent: (html: string) => void;
    setPortfolioData: (data: any) => void;
    setUploadedImages: (images: { id: string; file?: File; url: string; compressed: boolean; fileKey?: string }[]) => void;
    addUploadedImages: (images: { id: string; file?: File; url: string; compressed: boolean; fileKey?: string }[]) => void;
    removeUploadedImage: (id: string) => void;
    setBusinessData: (data: Business) => void;
    setWebsiteData: (data: Website) => void;
    setPathData: (data: any | null) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
    htmlContent: '',
    portfolioData: null,
    uploadedImages: [],
    businessData: null,
    webSiteData: null,
    pathData: null,
    setHtmlContent: (htmlContent) => set({ htmlContent }),
    setPortfolioData: (portfolioData) => set({ portfolioData }),
    setUploadedImages: (images) => set({ uploadedImages: images }),
    addUploadedImages: (images) => set((state) => ({ uploadedImages: [...state.uploadedImages, ...images] })),
    removeUploadedImage: (id) => set((state) => ({
        uploadedImages: state.uploadedImages.filter((img) => img.id !== id)
    })),
    setBusinessData: (data) => set({ businessData: data }),
    setWebsiteData: (data) => set({ webSiteData: data }),
    setPathData: (data: WebsitePath | null) => set({ pathData: data }),
}));
