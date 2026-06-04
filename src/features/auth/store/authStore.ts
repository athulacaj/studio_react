import { create } from 'zustand';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    UserCredential
} from 'firebase/auth';
import { auth } from '../../../config/firebase';

interface AuthState {
    currentUser: User | null;
    loading: boolean;
    signup: (email: string, password: string) => Promise<UserCredential>;
    login: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(() => ({
    currentUser: null,
    loading: true,

    signup: (email: string, password: string) => {
        return createUserWithEmailAndPassword(auth, email, password);
    },

    login: (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    },

    logout: () => {
        return signOut(auth);
    },
}));

// Initialize the auth listener immediately when the module loads.
// This sets up onAuthStateChanged once and keeps the store in sync with Firebase Auth.
const unsubscribe = onAuthStateChanged(auth, (user) => {
    useAuthStore.setState({ currentUser: user, loading: false });
});

// Export for potential cleanup (e.g., in tests)
export { unsubscribe };
