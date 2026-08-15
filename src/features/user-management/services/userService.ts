import ApiEndPoints from '../../../config/apiEndpoints';
import { StudioApiClient } from '../../../services/ApiInitalizer';
import { User } from '../../auth/types/userProfile';


export const getAllUsers = async (): Promise<User[]> => {
    return await StudioApiClient.get<{ data: User[] }>(ApiEndPoints.users.get.getAllusers()).then(res => res.data);
};

export const getUserById = async (id: string): Promise<User> => {
    return await StudioApiClient.get<{ data: User }>(ApiEndPoints.users.get.getUserById(id)).then(res => res.data);
};

export const createUser = async (payload: {
    email: string;
    name?: string;
    role?: string;
    approved?: boolean;
    password?: string;
}): Promise<User> => {
    return await StudioApiClient.post<{ data: User }>(ApiEndPoints.users.post.createUser(), payload).then(res => res.data);
};

export const updateUser = async (id: string, payload: {
    email?: string;
    name?: string;
    role?: string;
    approved?: boolean;
    password?: string;
}): Promise<User> => {
    return await StudioApiClient.patch<{ data: User }>(ApiEndPoints.users.patch.updateUser(id), payload).then(res => res.data);
};
