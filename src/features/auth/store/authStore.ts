import { create } from 'zustand';
import { signOut, UserCredential } from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { User } from '../types/userProfile';



interface AuthState {
    currentUser: User | null;

    loading: boolean;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(() => ({
    currentUser: null,
    loading: true,
    logout: () => {
        return signOut(auth);
    },
    setLoading: (loading: boolean) => {
        useAuthStore.setState({ loading });
    },

    setUser: (user: User) => {
        useAuthStore.setState({ currentUser: user });
    }
}));


