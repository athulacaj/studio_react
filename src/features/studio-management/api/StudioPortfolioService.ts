import { StudioApiClient } from "../../../services/ApiInitalizer";

export interface FileUploadDetail {
    fileName: string;
    contentType: string;
}

export interface UploadUrlsRequest {
    folder: string;
    files: FileUploadDetail[];
}

export interface UploadUrlsResponse {
    urls: {
        fileName: string;
        uploadUrl: string;
        fileKey: string;
    }[];
}

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
export const uploadFileToR2 = async (info: UploadFileInfo, file: File): Promise<void> => {
    try {
        const response = await fetch(info.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to upload file to R2: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error uploading file to R2:", error);
        throw error;
    }
};
