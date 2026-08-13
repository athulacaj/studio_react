import ApiEndPoints from '../../../config/apiEndpoints';
import { StudioApiClient } from '../../../services/ApiInitalizer';
import { User } from '../../auth/types/userProfile';


export const getAllUsers = async (): Promise<User[]> => {
    return await StudioApiClient.get<{ data: User[] }>(ApiEndPoints.users.get.getAllusers()).then(res => res.data);
};

export const getUserById = async (id: string): Promise<User> => {
    return await StudioApiClient.get<{ data: User }>(ApiEndPoints.users.get.getUserById(id)).then(res => res.data);
};
