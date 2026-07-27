export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    photoURL?: string;
    isAdmin?: boolean;
    tenantId?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
