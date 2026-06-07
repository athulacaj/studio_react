import { create } from 'zustand';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuthStore } from './authStore';
import { UserProfile } from '../types/userProfile';

interface UserState {
    userProfile: UserProfile | null;
    loading: boolean;
    error: string | null;
    /** Whether the user profile has been checked at least once */
    initialized: boolean;
    /** Fetch user profile from Firestore /user/{uid} */
    fetchUserProfile: () => Promise<void>;
    /** Create or update user profile in Firestore /user/{uid} */
    saveUserProfile: (data: Partial<UserProfile>) => Promise<void>;
    /** Reset user profile state */
    clearUserProfile: () => void;
}

const getCurrentUser = () => useAuthStore.getState().currentUser;

export const useUserStore = create<UserState>((set, get) => ({
    userProfile: null,
    loading: false,
    error: null,
    initialized: false,

    fetchUserProfile: async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            set({ userProfile: null, initialized: true, loading: false });
            return;
        }

        set({ loading: true, error: null });
        try {
            const userDocRef = doc(db, 'user', currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                set({
                    userProfile: {
                        uid: currentUser.uid,
                        email: data.email || currentUser.email || '',
                        name: data.name || '',
                        photoURL: data.photoURL || currentUser.photoURL || '',
                        isAdmin: data.isAdmin === true,
                        createdAt: data.createdAt?.toDate?.() || undefined,
                        updatedAt: data.updatedAt?.toDate?.() || undefined,
                    },
                    initialized: true,
                });
            } else {
                // Document doesn't exist yet — set profile with empty name
                set({
                    userProfile: {
                        uid: currentUser.uid,
                        email: currentUser.email || '',
                        name: '',
                        photoURL: currentUser.photoURL || '',
                    },
                    initialized: true,
                });
            }
        } catch (err: any) {
            console.error('Error fetching user profile:', err);
            set({ error: err.message, initialized: true });
        } finally {
            set({ loading: false });
        }
    },

    saveUserProfile: async (data: Partial<UserProfile>) => {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('No user authenticated');

        set({ loading: true, error: null });
        try {
            const userDocRef = doc(db, 'user', currentUser.uid);
            const existingDoc = await getDoc(userDocRef);

            const profileData: Record<string, any> = {
                ...data,
                email: currentUser.email || '',
                uid: currentUser.uid,
                updatedAt: serverTimestamp(),
            };

            if (!existingDoc.exists()) {
                profileData.createdAt = serverTimestamp();
            }

            await setDoc(userDocRef, profileData, { merge: true });

            // Update local state
            const currentProfile = get().userProfile;
            set({
                userProfile: {
                    uid: currentUser.uid,
                    email: currentUser.email || '',
                    name: '',
                    ...currentProfile,
                    ...data,
                    updatedAt: new Date(),
                },
            });
        } catch (err: any) {
            console.error('Error saving user profile:', err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    clearUserProfile: () => {
        set({ userProfile: null, initialized: false, error: null });
    },
}));

// Subscribe to auth changes: auto-fetch profile when user logs in, clear on logout
useAuthStore.subscribe((state, prevState) => {
    if (state.currentUser && state.currentUser !== prevState.currentUser) {
        useUserStore.getState().fetchUserProfile();
    }
    if (!state.currentUser && prevState.currentUser) {
        useUserStore.getState().clearUserProfile();
    }
});
