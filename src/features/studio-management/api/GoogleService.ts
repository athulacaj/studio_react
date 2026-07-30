import ApiEndPoints from '../../../config/apiEndpoints';
import { StudioApiClient } from '../../../services/ApiInitalizer';
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