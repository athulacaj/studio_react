import { StudioApiClient } from "../../../services/ApiInitalizer";
import axios from "axios";

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
        return await StudioApiClient.post<UploadUrlsResponse>('/upload-urls', data);
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
