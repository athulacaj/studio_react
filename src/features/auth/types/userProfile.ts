import { Role } from "../../../types/roles";

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

export interface User {
    name: string;
    email: string;
    photoUrl: string;
    userId: string;
    role: Role;
}