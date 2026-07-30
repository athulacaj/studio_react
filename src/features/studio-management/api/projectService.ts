import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { db } from '../../../config/firebase';
import { Project, SharedLink, DriveNode, DriveData, ProjectJoinDriveData, LinkCategory } from '../types';
import { StudioApiClient } from '../../../services/ApiInitalizer';
import ApiEndPoints from '../../../config/apiEndpoints';
import { SharedLinksParams } from '../../../types/apiEndPointTypes';

/**
 * Fetches project details from Firestore.
 * @param {string} userId 
 * @param {string} projectId 
 * @returns {Promise<Project>} Project data
 */
export const getProject = async (userId?: string, projectId?: string): Promise<{ data: ProjectJoinDriveData[] }> => {
    return await StudioApiClient.get<{ data: ProjectJoinDriveData[] }>(ApiEndPoints.projects.get.projects({
        userId: userId,
        projectId: projectId
    }));
};

export const createProject = async (project: Partial<Project>, driveData?: Partial<DriveData>): Promise<string> => {
    return await StudioApiClient.post<string>(ApiEndPoints.projects.post.projects(), { project, driveData });
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
        const payload: any = {
            createdBy: params.createdBy,
            sourceProjectId: params.sourceProjectId,
        };
        if (params.id) {
            payload.id = params.id;
        }
        const linkRef = await StudioApiClient.get<{ data: SharedLink[] }>(ApiEndPoints.projects.get.sharedLinks(payload))
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
        const storage = getStorage();
        const fileRef = ref(storage, filePath);
        const url = await getDownloadURL(fileRef);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch tree data: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching project tree data:", error);
        throw error;
    }
};


