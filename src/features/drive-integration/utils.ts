// Shared helpers for folder-based Drive syncing.

/** Image extensions we accept for folder uploads (covers common + RAW formats). */
export const ACCEPTED_IMAGE_EXTENSIONS = [
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'tif', 'tiff',
    'bmp', 'avif', 'dng', 'cr2', 'cr3', 'nef', 'arw', 'raf', 'orf', 'rw2',
];

/** Fallback MIME types for extensions the browser leaves blank (common with RAW/HEIC). */
const EXT_MIME: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
    gif: 'image/gif', heic: 'image/heic', heif: 'image/heif', tif: 'image/tiff',
    tiff: 'image/tiff', bmp: 'image/bmp', avif: 'image/avif',
    dng: 'image/x-adobe-dng', cr2: 'image/x-canon-cr2', cr3: 'image/x-canon-cr3',
    nef: 'image/x-nikon-nef', arw: 'image/x-sony-arw', raf: 'image/x-fuji-raf',
    orf: 'image/x-olympus-orf', rw2: 'image/x-panasonic-rw2',
};

/**
 * Relative path of a file within a picked directory.
 * `webkitRelativePath` looks like "MyFolder/sub/photo.jpg" for `<input webkitdirectory>`.
 */
export const fileRelPath = (file: File): string =>
    (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;

/** Directory portion of a relative path ("" when the file has no parent dir). */
export const dirOfPath = (path: string): string => {
    const i = path.lastIndexOf('/');
    return i === -1 ? '' : path.slice(0, i);
};

/** Lowercased extension without the dot ("" when none). */
export const getExtension = (name: string): string => {
    const i = name.lastIndexOf('.');
    return i === -1 ? '' : name.slice(i + 1).toLowerCase();
};

/** Whether a file is an image we can upload (by MIME or extension). */
export const isImageFile = (file: File): boolean =>
    file.type.startsWith('image/') || ACCEPTED_IMAGE_EXTENSIONS.includes(getExtension(file.name));

/** Best-effort MIME type, falling back to the extension map, then octet-stream. */
export const guessMimeType = (file: File): string =>
    file.type || EXT_MIME[getExtension(file.name)] || 'application/octet-stream';

/** The name of the top-level folder the admin picked. */
export const topFolderName = (files: File[]): string => {
    const rel = files[0] ? fileRelPath(files[0]) : '';
    const segments = rel.split('/');
    return segments.length > 1 ? segments[0] : 'Selected folder';
};

/** Count of distinct subfolders (excluding the top-level picked folder). */
export const countSubfolders = (files: File[]): number => {
    const dirs = new Set<string>();
    for (const file of files) {
        const dir = dirOfPath(fileRelPath(file));
        if (dir && dir.includes('/')) dirs.add(dir);
    }
    return dirs.size;
};
