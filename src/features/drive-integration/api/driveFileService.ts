import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../config/firebase';
import type {
    ExchangeTokenRequest,
    ExchangeTokenResponse,
    ListDriveContentsRequest,
    ListDriveContentsResponse,
    CreateDriveFolderRequest,
    CreateDriveFolderResponse,
    UploadToDriveRequest,
    UploadToDriveResponse,
    RevokeDriveAccessRequest,
    RevokeDriveAccessResponse,
    EnsureDriveFolderTreeRequest,
    EnsureDriveFolderTreeResponse,
    GetDriveManifestRequest,
    GetDriveManifestResponse,
    RecordDriveUploadsRequest,
    RecordDriveUploadsResponse,
} from '../types';

/**
 * Exchange an OAuth authorization code for tokens and create the Drive connection.
 */
export const exchangeDriveToken = async (
    data: ExchangeTokenRequest
): Promise<ExchangeTokenResponse> => {
    try {
        const fn = httpsCallable<ExchangeTokenRequest, ExchangeTokenResponse>(
            functions,
            'exchangeDriveToken'
        );
        const result = await fn(data);
        return result.data;
    } catch (error) {
        console.error('Error exchanging Drive token:', error);
        throw error;
    }
};

/**
 * List files and folders in a specific Drive folder.
 */
export const listDriveContents = async (
    data: ListDriveContentsRequest
): Promise<ListDriveContentsResponse> => {
    try {
        const fn = httpsCallable<ListDriveContentsRequest, ListDriveContentsResponse>(
            functions,
            'listDriveContents'
        );
        const result = await fn(data);
        return result.data;
    } catch (error) {
        console.error('Error listing Drive contents:', error);
        throw error;
    }
};

/**
 * Create a new folder in the connected Drive.
 */
export const createDriveFolder = async (
    data: CreateDriveFolderRequest
): Promise<CreateDriveFolderResponse> => {
    try {
        const fn = httpsCallable<CreateDriveFolderRequest, CreateDriveFolderResponse>(
            functions,
            'createDriveFolder'
        );
        const result = await fn(data);
        return result.data;
    } catch (error) {
        console.error('Error creating Drive folder:', error);
        throw error;
    }
};

/**
 * Upload a file to the connected Drive.
 */
export const uploadToDrive = async (
    data: UploadToDriveRequest
): Promise<UploadToDriveResponse> => {
    try {
        const fn = httpsCallable<UploadToDriveRequest, UploadToDriveResponse>(
            functions,
            'uploadToDrive'
        );
        const result = await fn(data);
        return result.data;
    } catch (error) {
        console.error('Error uploading to Drive:', error);
        throw error;
    }
};

/**
 * Recreate a set of relative folder paths under a base folder (mirroring a local tree).
 */
export const ensureDriveFolderTree = async (
    data: EnsureDriveFolderTreeRequest
): Promise<EnsureDriveFolderTreeResponse> => {
    try {
        const fn = httpsCallable<EnsureDriveFolderTreeRequest, EnsureDriveFolderTreeResponse>(
            functions,
            'ensureDriveFolderTree'
        );
        const result = await fn(data);
        return result.data;
    } catch (error) {
        console.error('Error ensuring Drive folder tree:', error);
        throw error;
    }
};

/**
 * Fetch the tracking records of files already synced to the connected Drive.
 */
export const getDriveManifest = async (
    data: GetDriveManifestRequest
): Promise<GetDriveManifestResponse> => {
    try {
        const fn = httpsCallable<GetDriveManifestRequest, GetDriveManifestResponse>(
            functions,
            'getDriveManifest'
        );
        const result = await fn(data);
        return result.data;
    } catch (error) {
        console.error('Error fetching Drive manifest:', error);
        throw error;
    }
};

/**
 * Persist upload records to Firestore and refresh the in-Drive manifest file.
 */
export const recordDriveUploads = async (
    data: RecordDriveUploadsRequest
): Promise<RecordDriveUploadsResponse> => {
    try {
        const fn = httpsCallable<RecordDriveUploadsRequest, RecordDriveUploadsResponse>(
            functions,
            'recordDriveUploads'
        );
        const result = await fn(data);
        return result.data;
    } catch (error) {
        console.error('Error recording Drive uploads:', error);
        throw error;
    }
};

/**
 * Revoke Drive access and delete the connection.
 */
export const revokeDriveAccess = async (
    data: RevokeDriveAccessRequest
): Promise<RevokeDriveAccessResponse> => {
    try {
        const fn = httpsCallable<RevokeDriveAccessRequest, RevokeDriveAccessResponse>(
            functions,
            'revokeDriveAccess'
        );
        const result = await fn(data);
        return result.data;
    } catch (error) {
        console.error('Error revoking Drive access:', error);
        throw error;
    }
};
