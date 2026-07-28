import { StudioApiClient } from '../../../services/ApiInitalizer';
import { User } from '../types/userProfile';


export const getMe = async (): Promise<User> => {
    return await StudioApiClient.get<{data: User}>('/auth/me').then(res => res.data);
};
