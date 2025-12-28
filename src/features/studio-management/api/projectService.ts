import { doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { db } from '../../../config/firebase';
import { Project, SharedLink, DriveNode } from '../types';

/**
 * Fetches project details from Firestore.
 * @param {string} userId 
 * @param {string} projectId 
 * @returns {Promise<Project>} Project data
 */
export const getProject = async (userId: string, projectId: string): Promise<Project> => {
    try {
        const projectRef = doc(db, 'projects', userId, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
            throw new Error('Project not found');
        }

        return projectSnap.data() as Project;
    } catch (error) {
        console.error("Error fetching project:", error);
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
export const getSharedLink = async (userId: string, projectId: string, linkId: string): Promise<SharedLink> => {
    try {
        const linkRef = doc(db, 'projects', userId, 'projects', projectId, 'shared_links', linkId);
        const linkSnap = await getDoc(linkRef);

        if (!linkSnap.exists()) {
            throw new Error('Share link not found');
        }

        return linkSnap.data() as SharedLink;
    } catch (error) {
        console.error("Error fetching shared link:", error);
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
