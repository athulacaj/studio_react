// This file is kept for backward compatibility.
// Auth state is now managed by Zustand in ../store/authStore.ts
// The AuthProvider is a no-op pass-through — all state lives in the Zustand store.
// useAuth is a convenience alias for useAuthStore.

import React, { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * @deprecated Use `useAuthStore` from '../store/authStore' directly instead.
 * This hook is kept for backward compatibility during migration.
 */
export function useAuth() {
    return useAuthStore();
}

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * @deprecated The AuthProvider is no longer needed since Zustand manages state globally.
 * It is kept as a pass-through wrapper so existing component trees don't break.
 * You can safely remove <AuthProvider> from App.tsx when ready.
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const { loading } = useAuthStore();

    // Still gate children on loading to preserve the original behavior
    // where the app waited for Firebase auth to initialize
    return <>{!loading && children}</>;
}
