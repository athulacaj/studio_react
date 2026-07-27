import { StudioApiClient } from '../../../services/ApiInitalizer';

export interface TenantPayload {
    ownerUserId?: string;
    name: string;
    slug: string;
    customDomain?: string;
    isActive?: boolean;
}

export interface TenantResponse {
    id: number;
    ownerUserId: string;
    name: string;
    slug: string;
    customDomain: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const createTenant = async (data: TenantPayload): Promise<TenantResponse> => {
    return await StudioApiClient.post<TenantResponse>('/tenant', data);
};

export const updateTenant = async (id: number, data: Partial<TenantPayload>): Promise<TenantResponse> => {
    return await StudioApiClient.put<TenantResponse>(`/tenant/${id}`, data);
};

export const getTenant = async (id: number): Promise<TenantResponse> => {
    return await StudioApiClient.get<TenantResponse>(`/tenant/${id}`);
};
