import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Project, SharedLink, DriveNode, DriveData, ProjectJoinDriveData, LinkCategory, SyncedFolder, SelectedAlbum, Source } from '../types';
import { AssetsApiClient, StudioApiClient } from '../../../services/ApiInitalizer';
import ApiEndPoints from '../../../config/apiEndpoints';
import { SharedLinksParams, SelectedAlbumsParams } from '../../../types/apiEndPointTypes';

/**
 * Fetches project details from Firestore.
 * @param {string} userId 
 * @param {string} projectId 
 * @returns {Promise<Project>} Project data
 */
export const getProject = async (userId?: string, projectId?: string): Promise<{ data: ProjectJoinDriveData[] }> => {
    const q: any = {
    }
    if (userId) q.userId = userId
    if (projectId) q.projectId = projectId
    // userId: userId ?? null,
    //     projectId: projectId ?? null
    return await StudioApiClient.get<{ data: ProjectJoinDriveData[] }>(ApiEndPoints.projects.get.projects(q));
};

export const getPublicProject = async (projectId: string): Promise<{ data: ProjectJoinDriveData[] }> => {

    return await StudioApiClient.get<{ data: ProjectJoinDriveData[] }>(ApiEndPoints.projects.get.public(projectId));
};

export const createProject = async (project: Partial<Project>, driveData?: Partial<DriveData>): Promise<{ data: Project }> => {
    return await StudioApiClient.post<{ data: Project }>(ApiEndPoints.projects.post.projects(), { project, driveData });
};

/**
 * Updates an existing project and its optional drive data.
 * @param {string} projectId
 * @param {Partial<Project> & { driveConnectionId?: string }} [project]
 * @param {{ driveData?: any; selectedFolders?: string[] }} [driveData]
 * @returns {Promise<{ data: Project }>} Updated project
 */
export interface UpdateProjectRequestData {
    name?: string;
    description?: string;
    source?: Source;
    status?: 'ready_for_sync' | 'synced' | 'failed' | 'initializing' | string;
    projectAssets?: 'gdrive' | 'storage' | string;
    driveUrl?: string;
    driveConnectionId?: string;
    localSyncFolderName?: string;
}

export const updateProject = async (
    projectId: string,
    project?: UpdateProjectRequestData,
    driveData?: {
        driveData?: any;
        selectedFolders?: string[];
    }
): Promise<{ data: Project }> => {
    try {
        const response = await StudioApiClient.put<{ data: Project }>(
            ApiEndPoints.projects.put.projects(projectId),
            { project, driveData }
        );
        return response;
    } catch (error) {
        console.error("Error updating project:", error);
        throw error;
    }
};

/**
 * Updates the project document with the currently selected local sync folder name.
 */
export const updateProjectSyncFolder = async (
    userId: string,
    projectId: string,
    folderName: string | null
): Promise<void> => {
    try {
        const projectRef = doc(db, 'projects', userId, 'projects', projectId);
        await updateDoc(projectRef, { localSyncFolderName: folderName });
    } catch (error) {
        console.error("Error updating project sync folder:", error);
        throw error;
    }
};


/**
 * Fetches shared link details from Firestore.
 * @param {string} userId 
 * @param {string} projectId 
 * @param {string} linkId 
 * @returns {Promise<SharedLink>} Shared link data
 */
export const getSharedLink = async (params: SharedLinksParams): Promise<SharedLink[]> => {
    try {
        const linkRef = await StudioApiClient.get<{ data: SharedLink[] }>(ApiEndPoints.projects.get.sharedLinks(params))
        return linkRef.data;
    } catch (error) {
        console.error("Error fetching shared link:", error);
        throw error;
    }
};
// {
//   "name": "string",
//   "sourceProjectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   "categories": [
//     {
//       "id": "string",
//       "name": "string",
//       "isHidden": true,
//       "label": "string"
//     }
//   ],
//   "includedFolders": [
//     "string"
//   ]
// }

type PostShareLinkData = {
    name?: string;
    sourceProjectId: string;
    categories: LinkCategory[];
    includedFolders: string[];
}



export const postShareLink = async (data: PostShareLinkData): Promise<any> => {
    try {
        const linkRef = await StudioApiClient.post<PostShareLinkData>(ApiEndPoints.projects.post.sharedLinks(), {
            name: data.name,
            sourceProjectId: data.sourceProjectId,
            categories: data.categories,
            includedFolders: data.includedFolders
        })
        return linkRef;
    } catch (error) {
        console.error("Error creating shared link:", error);
        throw error;
    }
};

type PutShareLinkData = {
    name?: string;
    categories?: LinkCategory[];
    includedFolders?: string[];
}

export const putShareLink = async (id: string, data: PutShareLinkData): Promise<any> => {
    try {
        const linkRef = await StudioApiClient.put<PutShareLinkData>(ApiEndPoints.projects.put.sharedLinks(id), {
            name: data.name,
            categories: data.categories,
            includedFolders: data.includedFolders
        });
        return linkRef;
    } catch (error) {
        console.error("Error updating shared link:", error);
        throw error;
    }
};


/**
 * Fetches the project tree structure (JSON) from Firebase Storage.
 * @param {string} filePath Path to the file in Firebase Storage
 * @returns {Promise<DriveNode>} The tree structure JSON
 */
export const getProjectTreeData = async (filePath: string): Promise<DriveNode> => {
    try {
        //     const storage = getStorage();
        //     const fileRef = ref(storage, filePath);
        //     const url = await getDownloadURL(fileRef);

        //     const response = await fetch(url);
        //     if (!response.ok) {
        //         throw new Error(`Failed to fetch tree data: ${response.statusText}`);
        //     }

        //     const data = await response.json();
        const data = await AssetsApiClient.get<DriveNode>(filePath);
        return data;
    } catch (error) {
        console.error("Error fetching project tree data:", error);
        throw error;
    }
};

/**
 * Fetches the synced folders for a project.
 * @param {string} projectId 
 * @returns {Promise<SyncedFolder[]>} Array of synced folders
 */
export const getSyncedFolders = async (projectId: string): Promise<Record<string, SyncedFolder>> => {
    try {
        const response = await StudioApiClient.get<{ data: Record<string, SyncedFolder>, success: boolean, message: string }>(ApiEndPoints.projects.get.syncedFolders(projectId));
        return response.data;
    } catch (error) {
        console.error("Error fetching synced folders:", error);
        throw error;
    }
};

/**
 * Creates a new selected album.
 * @param {SelectedAlbum} data Selected album data
 * @returns {Promise<any>} The response containing created selected album
 */
export const postSelectedAlbum = async (data: SelectedAlbum): Promise<any> => {
    try {
        const response = await StudioApiClient.post<SelectedAlbum>(ApiEndPoints.projects.post.selectedAlbums(), data);
        return response;
    } catch (error) {
        console.error("Error creating selected album:", error);
        throw error;
    }
};

/**
 * Fetches selected albums.
 * @param {SelectedAlbumsParams} params Query parameters
 * @returns {Promise<SelectedAlbum[]>} Array of selected albums
 */
export const getSelectedAlbums = async (params: SelectedAlbumsParams): Promise<SelectedAlbum[]> => {
    try {
        const response = await StudioApiClient.get<{ data: SelectedAlbum[] }>(ApiEndPoints.projects.get.selectedAlbums(params));
        return response.data;
    } catch (error) {
        console.error("Error fetching selected albums:", error);
        throw error;
    }
};

export type PutSelectedAlbumData = {
    action: 'add' | 'remove';
    value: string;
    imageId: string;
    sharedLinkId: string;
};

/**
 * Updates selection of an album.
 * @param {PutSelectedAlbumData} data Action and value
 * @returns {Promise<any>} Response
 */
export const putSelectedAlbum = async (data: PutSelectedAlbumData): Promise<any> => {
    try {
        const response = await StudioApiClient.put<PutSelectedAlbumData>(ApiEndPoints.projects.put.selectedAlbums(), data);
        return response;
    } catch (error) {
        console.error("Error updating selected album:", error);
        throw error;
    }
};
