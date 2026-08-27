import ApiEndPoints from '../../../config/apiEndpoints';
import { StudioApiClient } from '../../../services/ApiInitalizer';
import { DriveConnection } from '../../drive-integration';
import { ListDriveContentsResponse } from '../../drive-integration/types';
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