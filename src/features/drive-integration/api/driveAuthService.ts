import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import type { DriveConnection } from '../types';

/**
 * Fetch a Drive connection for a specific project.
 * Looks for an active connection where a Google account is linked.
 */
export const fetchDriveConnection = async (
    studioUserId: string,
    projectId: string
): Promise<DriveConnection | null> => {
    try {
        const q = query(
            collection(db, 'driveConnections'),
            where('studioUserId', '==', studioUserId),
            where('projectId', '==', projectId),
            where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as DriveConnection;
    } catch (error) {
        console.error('Error fetching Drive connection:', error);
        throw error;
    }
};

/**
 * Fetch a Drive connection by its ID.
 */
export const fetchDriveConnectionById = async (
    connectionId: string
): Promise<DriveConnection | null> => {
    try {
        const docSnap = await getDoc(doc(db, 'driveConnections', connectionId));
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() } as DriveConnection;
    } catch (error) {
        console.error('Error fetching Drive connection by ID:', error);
        throw error;
    }
};
