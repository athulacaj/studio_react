/**
 * File Indexing Service
 *
 * Uses the Chrome File System Access API (showDirectoryPicker) to let the user
 * pick a project folder, then recursively walks it and returns metadata for every
 * image file found.
 *
 * Optimised for large folders (up to ~50 000 files):
 *   • Streaming progress callback during scan
 *   • Lightweight metadata collection (only reads size/lastModified, avoids full File reads)
 */
import type { IndexedFileEntry } from '../types';
import { ACCEPTED_IMAGE_EXTENSIONS, getExtension, guessMimeType } from '../utils';

// ─── Browser-support guard ────────────────────────────────────────────────────
/** Returns `true` if the current browser supports the File System Access API. */
export const isFileSystemAccessSupported = (): boolean =>
    typeof window !== 'undefined' && 'showDirectoryPicker' in window;

// ─── Folder picker ────────────────────────────────────────────────────────────
/**
 * Open the native OS directory picker and return the handle.
 * Throws if the user cancels or the API is unsupported.
 */
export const pickDirectory = async (): Promise<FileSystemDirectoryHandle> => {
    if (!isFileSystemAccessSupported()) {
        throw new Error(
            'Your browser does not support the File System Access API. Please use Google Chrome, Edge, or another Chromium-based browser.'
        );
    }
    // showDirectoryPicker is only available on Chromium
    return await (window as any).showDirectoryPicker({ mode: 'read' });
};

// ─── Scan progress callback ──────────────────────────────────────────────────
export interface ScanProgressCallback {
    /** Called periodically during the scan with the count found so far. */
    (found: number, currentDir: string): void;
}

// ─── Recursive directory walker ───────────────────────────────────────────────
/**
 * Recursively walk a directory handle and collect every image file entry.
 *
 * Designed for directories with up to ~50 000 image files across many
 * subdirectories. Reports progress via the optional `onProgress` callback
 * so the UI can show a live file count.
 *
 * @param dirHandle   The directory to walk.
 * @param basePath    Accumulated relative path (empty string for the root).
 * @param onProgress  Optional callback invoked after each file is discovered.
 * @returns           A flat array of `IndexedFileEntry` for all discovered images.
 */
export const scanDirectory = async (
    dirHandle: FileSystemDirectoryHandle,
    basePath: string = '',
    onProgress?: ScanProgressCallback
): Promise<IndexedFileEntry[]> => {
    const entries: IndexedFileEntry[] = [];

    // Internal recursive helper that mutates `entries` to avoid
    // repeated array spreading on large sets.
    const walk = async (handle: FileSystemDirectoryHandle, path: string) => {
        for await (const [name, childHandle] of (handle as any).entries()) {
            if (childHandle.kind === 'directory') {
                const subPath = path ? `${path}/${name}` : name;
                await walk(childHandle as FileSystemDirectoryHandle, subPath);
            } else if (childHandle.kind === 'file') {
                const ext = getExtension(name);
                if (!ACCEPTED_IMAGE_EXTENSIONS.includes(ext)) continue;

                const file: File = await (childHandle as FileSystemFileHandle).getFile();
                const relativePath = path; // directory portion only
                const id = relativePath ? `${relativePath}/${name}` : name;

                entries.push({
                    id,
                    name,
                    relativePath,
                    size: file.size,
                    lastModified: new Date(file.lastModified),
                    mimeType: guessMimeType(file),
                    handle: childHandle as FileSystemFileHandle,
                });

                // Report progress (throttle-friendly: every file discovered)
                if (onProgress) {
                    onProgress(entries.length, path || handle.name);
                }
            }
        }
    };

    await walk(dirHandle, basePath);
    return entries;
};

// ─── Public convenience ───────────────────────────────────────────────────────
/**
 * Full flow: pick a folder → scan → return entries + folder name.
 *
 * @param onProgress  Optional scan progress callback (count, current dir).
 */
export const pickAndScanFolder = async (
    onProgress?: ScanProgressCallback
): Promise<{
    folderName: string;
    handle: FileSystemDirectoryHandle;
    files: IndexedFileEntry[];
}> => {
    const handle = await pickDirectory();
    const files = await scanDirectory(handle, '', onProgress);
    return { folderName: handle.name, handle, files };
};
