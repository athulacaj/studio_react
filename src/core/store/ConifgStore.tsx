import { create } from 'zustand';
//  create a store for conifg
interface ConfigState {
    showNavBar: boolean;
    setShowNavBar: (value: boolean) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
    showNavBar: true,
    setShowNavBar: (value: boolean) => set({ showNavBar: value }),
}))