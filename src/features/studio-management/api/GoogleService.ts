import ApiEndPoints from '../../../config/apiEndpoints';
import { StudioApiClient } from '../../../services/ApiInitalizer';
import { DriveConnection } from '../../drive-integration';
import { EnsureDriveFolderTreeResponse, ListDriveContentsResponse } from '../../drive-integration/types';
import { DriveData, DriveNode, Project } from '../types';


export const getFolderStructure = async (url: string): Promise<DriveNode> => {
    return await StudioApiClient.post<DriveNode>(ApiEndPoints.google.post.folderStructure(), { url });
};

interface UploadDriveDataParams {
    projectId: string;
    url?: string;
    folderId?: string;
    recursive?: boolean;
}
export const uploadDriveData = async (params: UploadDriveDataParams) => {
    return await StudioApiClient.post(ApiEndPoints.google.post.uploadDriveData(), params);
};

export interface ExchangeDriveTokenParams {
    code: string;
    redirectUri: string;
    projectId: string;
    projectName: string;
}

export const exchangeDriveToken = async (params: ExchangeDriveTokenParams) => {
    return await StudioApiClient.post(ApiEndPoints.google.post.exchangeDriveToken(), params);
};

export const getDriveConnection = async (connectionId?: string, projectId?: string): Promise<{ data: DriveConnection | null }> => {
    return await StudioApiClient.post(ApiEndPoints.google.post.connection(), { connectionId, projectId });
};

export interface ListDriveContentsParams {
    connectionId: string;
    folderId: string;
}

export const listDriveContents = async (params: ListDriveContentsParams): Promise<{ data: ListDriveContentsResponse }> => {
    return await StudioApiClient.post(ApiEndPoints.google.post.listContents(), params);
};

export interface CreateDriveFolderParams {
    connectionId: string;
    parentFolderId: string;
    folderName: string;
}

export const createDriveFolder = async (params: CreateDriveFolderParams): Promise<{ data: { id: string } }> => {
    return await StudioApiClient.post(ApiEndPoints.google.post.createFolder(), params);
};

export interface UploadToDriveParams {
    connectionId: string;
    folderId: string;
    fileName: string;
    fileContent: string;
    mimeType: string;
}

export const uploadToDrive = async (params: UploadToDriveParams): Promise<{ data: { id: string } }> => {
    return await StudioApiClient.post(ApiEndPoints.google.post.uploadToDrive(), params);
};

export interface EnsureFolderTreeParams {
    connectionId: string;
    baseFolderId: string;
    folderPaths: string[];
}

export const ensureDriveFolderTree = async (params: EnsureFolderTreeParams): Promise<{ data: EnsureDriveFolderTreeResponse }> => {
    return await StudioApiClient.post(ApiEndPoints.google.post.ensureFolderTree(), params);
};

export interface GetDriveTreeParams {
    url?: string;
    folderId?: string;
}

export const getDriveTree = async (params: GetDriveTreeParams): Promise<{ data: any }> => {
    return await StudioApiClient.post(ApiEndPoints.google.post.driveTree(), params);
};

export interface RevokeDriveAccessParams {
    connectionId: string;
}

export const revokeDriveAccess = async (params: RevokeDriveAccessParams): Promise<{ data: any }> => {
    return await StudioApiClient.post(ApiEndPoints.google.post.revokeAccess(), params);
};

export interface GetDriveAccessTokenParams {
    connectionId: string;
}

export const getDriveAccessToken = async (params: GetDriveAccessTokenParams): Promise<{ data: Record<string, any> }> => {
    return (await StudioApiClient.post(ApiEndPoints.google.post.accessToken(), params));
};