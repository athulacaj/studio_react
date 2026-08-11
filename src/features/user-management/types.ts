/**
 * Types for the user-management feature.
 */

export interface UserListItem {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    isAdmin?: boolean;
    createdAt?: any;
}
