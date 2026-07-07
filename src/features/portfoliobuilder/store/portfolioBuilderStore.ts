import { create } from 'zustand';
import { WeddingFormData, DEFAULT_WEDDING_DATA } from '../types/types';

interface PortfolioBuilderState {
  formData: WeddingFormData;
  selectedTemplate: string;
  eventPath: string;
  isSaving: boolean;
  portfolioId: string | null;
  projectId: string | null;
  isExisting: boolean;

  // Actions
  setFormData: (data: Partial<WeddingFormData>) => void;
  setFullFormData: (data: WeddingFormData) => void;
  setTemplate: (templateId: string) => void;
  setEventPath: (path: string) => void;
  setIsSaving: (saving: boolean) => void;
  setPortfolioId: (id: string) => void;
  setProjectId: (id: string | null) => void;
  setIsExisting: (existing: boolean) => void;
  updateDetail: (index: number, detail: Partial<WeddingFormData['details'][0]>) => void;
  addDetail: () => void;
  removeDetail: (index: number) => void;
  updateGalleryItem: (index: number, url: string) => void;
  addGalleryItem: () => void;
  removeGalleryItem: (index: number) => void;
  reset: () => void;
}

export const usePortfolioBuilderStore = create<PortfolioBuilderState>((set, get) => ({
  formData: { ...DEFAULT_WEDDING_DATA },
  selectedTemplate: 'template1',
  eventPath: '',
  isSaving: false,
  portfolioId: null,
  projectId: null,
  isExisting: false,

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setFullFormData: (data) => set({ formData: data }),

  setTemplate: (templateId) => set({ selectedTemplate: templateId }),

  setEventPath: (path) => set({ eventPath: path }),

  setIsSaving: (saving) => set({ isSaving: saving }),

  setPortfolioId: (id) => set({ portfolioId: id }),

  setProjectId: (id) => set({ projectId: id }),

  setIsExisting: (existing) => set({ isExisting: existing }),

  updateDetail: (index, detail) =>
    set((state) => {
      const details = [...state.formData.details];
      details[index] = {
        ...details[index],
        ...detail,
        location: {
          ...details[index].location,
          ...(detail.location || {}),
        },
      };
      return { formData: { ...state.formData, details } };
    }),

  addDetail: () =>
    set((state) => ({
      formData: {
        ...state.formData,
        details: [
          ...state.formData.details,
          {
            type: 'ceremony',
            time: '',
            location: { name: '', url: '', desc: '' },
          },
        ],
      },
    })),

  removeDetail: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        details: state.formData.details.filter((_, i) => i !== index),
      },
    })),

  updateGalleryItem: (index, url) =>
    set((state) => {
      const gallery = [...state.formData.gallery];
      gallery[index] = { url };
      return { formData: { ...state.formData, gallery } };
    }),

  addGalleryItem: () =>
    set((state) => ({
      formData: {
        ...state.formData,
        gallery: [...state.formData.gallery, { url: '' }],
      },
    })),

  removeGalleryItem: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        gallery: state.formData.gallery.filter((_, i) => i !== index),
      },
    })),

  reset: () =>
    set({
      formData: { ...DEFAULT_WEDDING_DATA },
      selectedTemplate: 'template1',
      eventPath: '',
      isSaving: false,
      portfolioId: null,
      projectId: null,
      isExisting: false,
    }),
}));
