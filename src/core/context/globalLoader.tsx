import { create } from "zustand";


type GlobalLoaderState = {
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
};

export const useGlobalLoader = create<GlobalLoaderState>((set) => ({
    isLoading: false,
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));
