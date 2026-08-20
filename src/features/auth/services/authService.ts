import ApiEndPoints from '../../../config/apiEndpoints';
import { StudioApiClient } from '../../../services/ApiInitalizer';
import { User } from '../types/userProfile';

export const login = async (credentials: { email: string, password: string }): Promise<{ success: boolean; data: User }> => {
    return await StudioApiClient.post<{ success: boolean; data: User }>(ApiEndPoints.auth.post.login(), credentials);
};

export const getMe = async (): Promise<User> => {
    return await StudioApiClient.get<{ data: User }>(ApiEndPoints.auth.get.me()).then(res => res.data);
};

export const adminSwithUser = async (id: string): Promise<{ user: User }> => {
    return await StudioApiClient.get<{ data: { user: User } }>(ApiEndPoints.auth.get.adminSwitch(id)).then(res => res.data);
};
