import { create } from 'zustand';
import { signOut } from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { User } from '../types/userProfile';
import { Role } from '../../../types/roles';

interface AuthState {
    currentUser: User | null;
    loading: boolean;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
    logout: () => Promise<void>;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    currentUser: null,
    loading: true,

    logout: () => {
        return signOut(auth);
    },

    setLoading: (loading: boolean) => {
        set({ loading });
    },

    setUser: (user: User) => {
        set({ currentUser: user });
    },

    isAdmin: () => {
        const user = get().currentUser;
        return user?.role === Role.ADMIN;
    },
}));