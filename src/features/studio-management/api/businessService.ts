import ApiEndPoints from '../../../config/apiEndpoints';
import { StudioApiClient } from '../../../services/ApiInitalizer';

export interface BusinessPayload {
    ownerUserId?: string;
    name: string;
    slug: string;
    customDomain?: string;
    isActive?: boolean;
}

export interface Business {
    id: number;
    ownerUserId: string;
    name: string;
    slug: string;
    customDomain: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    typeId: number;
}

export const createBusiness = async (data: BusinessPayload): Promise<Business> => {
    return await StudioApiClient.post<Business>(ApiEndPoints.business.post.business(), data);
};

export const updateBusiness = async (id: string, data: Partial<BusinessPayload>): Promise<Business> => {
    return await StudioApiClient.put<Business>(ApiEndPoints.business.put.business(id), data);
};

export const getBusiness = async (id: string): Promise<Business> => {
    return await StudioApiClient.get<Business>(ApiEndPoints.business.get.business(id));
};
export const getBusinessByUserId = async (userId: string): Promise<{ data: Business[] }> => {
    return await StudioApiClient.get<{ data: Business[] }>(ApiEndPoints.business.get.byUserId(userId));
};
