import { create } from 'zustand';
import { Business } from '../../studio-management/api/businessService';
import { Website, WebsitePath } from '../api/WebsiteService';

interface PortfolioState {
    // Content & Data
    htmlContent: string;
    portfolioData: any;
    businessData: Business | null;
    webSiteData: Website | null;
    pathData: WebsitePath | null;
    uploadedImages: { id: string; file?: File; url: string; compressed: boolean; fileKey?: string }[];

    // Steps & UI States
    step: 1 | 2;
    error: string | null;
    previewMode: 'desktop' | 'mobile';
    activeTab: number;

    // Loading & Async States
    isInitialLoading: boolean;
    isPublishing: boolean;

    // Versioning States
    versions: { path: string; publishedAt: string }[];
    selectedVersionPath: string;

    // Asset Processing & Uploading States
    isUploadDialogOpen: boolean;
    isProcessingFiles: boolean;
    isUploading: boolean;
    uploadProgress: number;

    // Content & Data Setters
    setHtmlContent: (html: string) => void;
    setPortfolioData: (data: any) => void;
    setUploadedImages: (images: { id: string; file?: File; url: string; compressed: boolean; fileKey?: string }[]) => void;
    addUploadedImages: (images: { id: string; file?: File; url: string; compressed: boolean; fileKey?: string }[]) => void;
    removeUploadedImage: (id: string) => void;
    setBusinessData: (data: Business) => void;
    setWebsiteData: (data: Website) => void;
    setPathData: (data: WebsitePath | null) => void;

    // Steps & UI Setters
    setStep: (step: 1 | 2) => void;
    setError: (error: string | null) => void;
    setPreviewMode: (mode: 'desktop' | 'mobile') => void;
    setActiveTab: (tab: number) => void;

    // Loading & Async Setters
    setIsInitialLoading: (isLoading: boolean) => void;
    setIsPublishing: (isPublishing: boolean) => void;

    // Versioning Setters
    setVersions: (versions: { path: string; publishedAt: string }[] | ((prev: { path: string; publishedAt: string }[]) => { path: string; publishedAt: string }[])) => void;
    setSelectedVersionPath: (path: string) => void;

    // Asset Processing & Uploading Setters
    setIsUploadDialogOpen: (isOpen: boolean) => void;
    setIsProcessingFiles: (isProcessing: boolean) => void;
    setIsUploading: (isUploading: boolean) => void;
    setUploadProgress: (progress: number) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
    // Initial Values
    htmlContent: '',
    portfolioData: null,
    uploadedImages: [],
    businessData: null,
    webSiteData: null,
    pathData: null,

    step: 1,
    error: null,
    previewMode: 'desktop',
    activeTab: 0,

    isInitialLoading: true,
    isPublishing: false,

    versions: [],
    selectedVersionPath: '',

    isUploadDialogOpen: false,
    isProcessingFiles: false,
    isUploading: false,
    uploadProgress: 0,

    // Content & Data Actions
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

    // Steps & UI Actions
    setStep: (step) => set({ step }),
    setError: (error) => set({ error }),
    setPreviewMode: (previewMode) => set({ previewMode }),
    setActiveTab: (activeTab) => set({ activeTab }),

    // Loading & Async Actions
    setIsInitialLoading: (isInitialLoading) => set({ isInitialLoading }),
    setIsPublishing: (isPublishing) => set({ isPublishing }),

    // Versioning Actions
    setVersions: (updater) => set((state) => ({
        versions: typeof updater === 'function' ? updater(state.versions) : updater
    })),
    setSelectedVersionPath: (selectedVersionPath) => set({ selectedVersionPath }),

    // Asset Processing & Uploading Actions
    setIsUploadDialogOpen: (isUploadDialogOpen) => set({ isUploadDialogOpen }),
    setIsProcessingFiles: (isProcessingFiles) => set({ isProcessingFiles }),
    setIsUploading: (isUploading) => set({ isUploading }),
    setUploadProgress: (uploadProgress) => set({ uploadProgress }),
}));

