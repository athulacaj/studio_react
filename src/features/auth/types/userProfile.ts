export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    photoURL?: string;
    isAdmin?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
