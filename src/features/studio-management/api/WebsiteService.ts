import ApiEndPoints from "../../../config/apiEndpoints";
import { StudioApiClient } from "../../../services/ApiInitalizer";
import axios from "axios";
import { GetWebsitesParams } from "../../../types/apiEndPointTypes";
export interface FileUploadDetail {
    fileName: string;
    contentType: string;
}

export interface UploadUrlsRequest {
    folder: string;
    files: FileUploadDetail[];
}

export type UploadUrlsResponse = {
    key: string;
    uploadUrl: string;
}[];

/**
 * Gets presigned URLs for uploading files to R2.
 */
export const getUploadUrls = async (data: UploadUrlsRequest): Promise<UploadUrlsResponse> => {
    try {
        return await StudioApiClient.post<UploadUrlsResponse>(ApiEndPoints.website.post["upload-urls"](), data);
    } catch (error) {
        console.error("Error getting upload URLs:", error);
        throw error;
    }
};

export interface UploadFileInfo {
    key: string;
    uploadUrl: string;
}

/**
 * Uploads a file directly to Cloudflare R2 using a presigned URL.
 */
export const uploadFileToR2 = async (info: UploadFileInfo, file: File, onProgress?: (progress: number) => void): Promise<void> => {
    try {
        await axios.put(info.uploadUrl, file, {
            headers: {
                'Content-Type': file.type,
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        });
    } catch (error) {
        console.error("Error uploading file to R2:", error);
        throw error;
    }
};

export interface CreateWebsiteRequest {
    businessId: number;
    projectId: string | null;
    pathId: string;
    assets?: any;
    currentPath?: string;
    r2BaseUrl?: string;
    versions?: any;
}

export interface UpdateWebsiteRequest {
    businessId?: number;
    projectId?: string;
    pathId?: string;
    assets?: any;
    currentPath?: string;
    r2BaseUrl?: string;
    versions?: any;
}
export interface Website {
    id: number;
    businessId: number;
    projectId: string | null;
    pathId: string;
    assets?: any;
    currentPath?: string;
    r2BaseUrl?: string;
    versions?: any;
}

export const createWebsite = async (data: CreateWebsiteRequest) => {
    try {
        return await StudioApiClient.post<{ data: Website }>(ApiEndPoints.website.post.website(), data);
    } catch (error) {
        console.error("Error creating website:", error);
        throw error;
    }
};

export const getWebsites = async (params: GetWebsitesParams) => {
    try {
        return await StudioApiClient.get<{ data: Website[] }>(ApiEndPoints.website.get.website(params));
    } catch (error) {
        console.error("Error fetching websites:", error);
        throw error;
    }
};

export const updateWebsite = async (id: number, data: UpdateWebsiteRequest) => {
    try {
        return await StudioApiClient.put<{ data: Website }>(ApiEndPoints.website.put.website(id), data);
    } catch (error) {
        console.error("Error updating website:", error);
        throw error;
    }
};

export interface CreateWebsitePathRequest {
    businessId: number;
    path: string;
}

export const createWebsitePath = async (data: CreateWebsitePathRequest): Promise<WebsitePath> => {
    try {
        return (await StudioApiClient.post<{ data: WebsitePath }>(ApiEndPoints.website.post.path(), data)).data;
    } catch (error) {
        console.error("Error creating website path:", error);
        throw error;
    }
};
export interface WebsitePath {
    id: string;
    businessId: number;
    path: string;
    createdAt: string;
    updatedAt: string;
}
export const getWebsitePaths = async (businessId: number): Promise<WebsitePath[]> => {
    try {
        return (await StudioApiClient.get<{ data: WebsitePath[] }>(ApiEndPoints.website.get.path(businessId))).data;
    } catch (error) {
        console.error("Error fetching website paths:", error);
        throw error;
    }
};
