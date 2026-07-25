/**
 * File API Service
 *
 * Wraps the shared `apiClient` to call the Studio Backend REST API
 * for file metadata CRUD operations.
 *
 * For large projects (up to ~50 000 files) the bulk-upsert is chunked
 * into batches of BULK_CHUNK_SIZE to avoid HTTP payload limits and
 * backend transaction timeouts.
 */
import { StudioApiClient } from '../../../services/ApiInitalizer';
import type { BackendFileRecord } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────
/**
 * Max files per bulk-upsert request. Keeps payloads under typical body-parser
 * limits (~1 MB for JSON) and prevents long-running DB transactions.
 */
const BULK_CHUNK_SIZE = 500;

// ─── Request / Response shapes ────────────────────────────────────────────────
export interface UpsertFilePayload {
    name: string;
    relativePath: string;
    updatedAt: string; // ISO 8601
    deleted?: boolean;
    status?: string;
    url?: string | null;
}

interface BulkUpsertPayload {
    files: UpsertFilePayload[];
}

interface GetFilesResponse {
    projectId: string;
    lastSync: string;
    files: BackendFileRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Split an array into chunks of `size`. */
const chunk = <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Bulk-upsert file metadata for a project.
 * Automatically chunks into batches of BULK_CHUNK_SIZE (500) to handle
 * up to 50 000 files without hitting HTTP payload or timeout limits.
 *
 * @param onChunkComplete  Optional callback after each chunk, receives cumulative count.
 */
export const indexFiles = async (
    projectId: string,
    files: UpsertFilePayload[],
    onChunkComplete?: (completed: number, total: number) => void
): Promise<void> => {
    if (files.length === 0) return;

    const chunks = chunk(files, BULK_CHUNK_SIZE);
    let completed = 0;

    for (const batch of chunks) {
        const payload: BulkUpsertPayload = { files: batch };
        await StudioApiClient.post(`/projects/${projectId}/files/bulk`, payload);
        completed += batch.length;
        onChunkComplete?.(completed, files.length);
    }
};

/**
 * Upsert a single file's metadata (typically to update status/url after upload).
 * Maps to `POST /projects/:projectId/files`.
 */
export const upsertFile = async (
    projectId: string,
    file: UpsertFilePayload
): Promise<void> => {
    await StudioApiClient.post(`/projects/${projectId}/files`, file);
};

/**
 * Fetch files for a project, optionally only those modified since `updatedSince`.
 * Maps to `GET /projects/:projectId/files?updatedSince=...`.
 */
export const getFiles = async (
    projectId: string,
    updatedSince?: string
): Promise<GetFilesResponse> => {
    const params: Record<string, unknown> = {};
    if (updatedSince) params.updatedSince = updatedSince;
    return StudioApiClient.get<GetFilesResponse>(`/projects/${projectId}/files`, { params });
};
