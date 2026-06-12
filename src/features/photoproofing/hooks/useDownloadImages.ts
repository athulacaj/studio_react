import { useState, useRef } from 'react';
import { ImageObj } from '../types';
import { usePhotoProofingStore } from '../store/usePhotoProofingStore';
import { delay } from '../../../shared/utils/delay';

export const useDownloadImages = () => {
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentFileName, setCurrentFileName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const {
        sourceDirectoryHandle, setSourceDirectoryHandle,
        destinationDirectoryHandle, setDestinationDirectoryHandle
    } = usePhotoProofingStore();

    const cancelDownload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setDownloading(false);
    };

    /**
     * Downloads images directly to a selected local folder.
     * Uses File System Access API to avoid memory issues with large files (10GB+).
     */
    const downloadToFolder = async (images: ImageObj[], source: 'cloud' | 'local') => {
        if (!images || images.length === 0) return;
        const isGdriveUrl = true;
        let doNotShowDirSelector = false;
        doNotShowDirSelector = source === 'cloud' && isGdriveUrl;
        try {
            let destRoot = destinationDirectoryHandle;
            if (!doNotShowDirSelector) {
                if (destRoot) {
                    const change = confirm(`Existing destination: ${destRoot.name}. Do you want to change it?`);
                    if (change) {
                        // @ts-ignore
                        destRoot = await window.showDirectoryPicker();
                        if (destRoot) setDestinationDirectoryHandle(destRoot);
                    }
                } else {
                    alert(`Please select the DESTINATION folder where you want to ${source === 'local' ? 'copy' : 'download'} the images.`);
                    // @ts-ignore
                    destRoot = await window.showDirectoryPicker();
                    if (destRoot) setDestinationDirectoryHandle(destRoot);
                }
            }
            if (!doNotShowDirSelector) {
                if (!destRoot) return;
            }


            let sourceRoot = sourceDirectoryHandle;
            if (source === 'local') {
                if (sourceRoot) {
                    const change = confirm(`Existing source: ${sourceRoot.name}. Do you want to change it?`);
                    if (change) {
                        // @ts-ignore
                        sourceRoot = await window.showDirectoryPicker();
                        if (sourceRoot) setSourceDirectoryHandle(sourceRoot);
                    }
                } else {
                    alert('Please select the SOURCE folder containing your original images.');
                    // @ts-ignore
                    sourceRoot = await window.showDirectoryPicker();
                    if (sourceRoot) setSourceDirectoryHandle(sourceRoot);
                }
                if (!sourceRoot) return;
            }


            setDownloading(true);
            setProgress(0);
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            if (isGdriveUrl && source === 'cloud') {
                const batchSize = 4;
                for (let i = 0; i < images.length; i += batchSize) {
                    if (signal.aborted) throw new Error('Download aborted by user');
                    const batch = images.slice(i, i + batchSize);

                    for (let j = 0; j < batch.length; j++) {
                        if (signal.aborted) throw new Error('Download aborted by user');
                        const image = batch[j];
                        const fileName = image.name || `image_${i + j}.jpg`;
                        setCurrentFileName(fileName);

                        const downloadUrl = `https://drive.usercontent.google.com/download?id=${image.id}&export=download`
                        // open the url in a new window
                        await delay(500)
                        window.open(downloadUrl, '_blank', "noopener");

                        setProgress(Math.round(((i + j + 1) / images.length) * 100));
                    }

                    if (i + batchSize < images.length) {
                        try {
                            // Wait for 4 seconds between batches
                            await delay(4000);
                        } catch (e) {
                            // ignore delay abort if any
                        }
                        if (signal.aborted) throw new Error('Download aborted by user');
                    }
                }
            } else {
                // File System Access API path (Local or future Cloud-to-FS)
                for (let i = 0; i < images.length; i++) {
                    if (signal.aborted) throw new Error('Download aborted by user');
                    const image = images[i];
                    const fileName = image.name || `image_${i}.jpg`;
                    setCurrentFileName(fileName);

                    if (destRoot) {
                        try {
                            // 1. Handle subfolder structure in destination
                            let currentDestHandle = destRoot;
                            if (image.folderPathList && image.folderPathList.length > 0) {
                                for (const folderName of image.folderPathList) {
                                    currentDestHandle = await currentDestHandle.getDirectoryHandle(folderName, { create: true });
                                }
                            }

                            // 2. Create the target file
                            const destFileHandle = await currentDestHandle.getFileHandle(fileName, { create: true });
                            const writable = await destFileHandle.createWritable();

                            try {
                                if (source === 'cloud') {
                                    // Download from Cloud and stream to disk
                                    const downloadUrl = `https://drive.usercontent.google.com/download?id=${image.id}&export=download`
                                    const res = await fetch(downloadUrl, { signal });
                                    if (res.body) {
                                        await res.body.pipeTo(writable, { signal });
                                    } else {
                                        const blob = await res.blob();
                                        await writable.write(blob);
                                    }

                                } else if (source === 'local' && sourceRoot) {
                                    // Local to Local copy
                                    await copyLocalFile(sourceRoot, writable, image, fileName, signal);
                                }

                                try {
                                    await writable.close();
                                } catch (e) {
                                    // Already closed or aborted
                                }
                            } catch (innerErr: any) {
                                if (innerErr.name !== 'AbortError') {
                                    console.error(`Error during write/copy for ${fileName}:`, innerErr);
                                }
                                try {
                                    await writable.abort();
                                } catch (e) { /* ignore */ }
                                if (signal.aborted || innerErr.name === 'AbortError') throw new Error('Download aborted by user');
                            }
                        } catch (err: any) {
                            if (err.message === 'Download aborted by user') throw err;
                            console.error(`Error saving ${fileName}:`, err);
                        }
                    }

                    setProgress(Math.round(((i + 1) / images.length) * 100));
                }
            }

            alert(`${source === 'local' ? 'Copy' : 'Download'} complete! All images saved to your folder.`);
        } catch (error: any) {
            console.error('Folder operation failed:', error);
            if (error instanceof Error && (error.name === 'AbortError' || error.name === 'NotAllowedError' || error.message === 'Download aborted by user')) {
                // User cancelled or denied
                console.log('Operation cancelled by user');
            } else if (error instanceof Error) {
                alert(error.message);
            }
        } finally {
            setDownloading(false);
            setProgress(0);
            setCurrentFileName('');
            abortControllerRef.current = null;
        }
    };

    const copyLocalFile = async (sourceRoot: FileSystemDirectoryHandle, writable: FileSystemWritableFileStream, image: ImageObj, fileName: string, signal?: AbortSignal) => {
        try {
            let currentSourceHandle = sourceRoot;
            if (image.folderPathList && image.folderPathList.length > 0) {
                for (const folderName of image.folderPathList) {
                    // We try to find the folder. If it doesn't exist, this will throw.
                    if (currentSourceHandle.name === folderName) continue;
                    currentSourceHandle = await currentSourceHandle.getDirectoryHandle(folderName);
                }
            }
            const sourceFileHandle = await currentSourceHandle.getFileHandle(fileName);
            const sourceFile = await sourceFileHandle.getFile();

            // Stream local file to destination
            await sourceFile.stream().pipeTo(writable, { signal });
        } catch (localErr) {
            console.error(`Could not find source file for ${fileName}:`, localErr);
            throw localErr;
        }
    }

    const startLocalCopy = async (images: ImageObj[], albumName: string) => {
        if (!sourceDirectoryHandle || !destinationDirectoryHandle) {
            setError("Source or Destination folder not selected.");
            return;
        }

        setDownloading(true);
        setProgress(0);
        setError(null);
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            // Create the album folder once (optimization) or per file (safer for async race if not careful, but JS is single threaded enough here)
            // safer to do it inside loop or just ensure it exists.

            for (let i = 0; i < images.length; i++) {
                if (signal.aborted) throw new Error('Download aborted by user');
                const image = images[i];
                const fileName = image.name || `image_${i}.jpg`;
                setCurrentFileName(fileName);

                try {
                    // 1. Get/CreateAlbum folder in destination
                    let currentDestHandle = await destinationDirectoryHandle.getDirectoryHandle(albumName, { create: true });

                    // 2. Handle subfolder structure INSIDE the album folder
                    if (image.folderPathList && image.folderPathList.length > 0) {
                        for (const folderName of image.folderPathList) {
                            currentDestHandle = await currentDestHandle.getDirectoryHandle(folderName, { create: true });
                        }
                    }

                    // 3. Create the target file
                    const destFileHandle = await currentDestHandle.getFileHandle(fileName, { create: true });
                    const writable = await destFileHandle.createWritable();

                    try {
                        await copyLocalFile(sourceDirectoryHandle, writable, image, fileName, signal);
                        try { await writable.close(); } catch (e) { /* already closed */ }
                    } catch (innerErr: any) {
                        if (innerErr.name !== 'AbortError') {
                            console.error(`Error during write/copy for ${fileName}:`, innerErr);
                        }
                        try { await writable.abort(); } catch (e) { /* ignore */ }
                        if (signal.aborted || innerErr.name === 'AbortError') throw new Error('Download aborted by user');
                        throw innerErr;
                    }

                } catch (err: any) {
                    console.error(`Error saving ${fileName}:`, err);
                    setError(`Error copying ${fileName}: ${err.message}`);
                }

                setProgress(Math.round(((i + 1) / images.length) * 100));
            }
        } catch (e: any) {
            if (e.message === 'Download aborted by user' || e.name === 'AbortError') {
                console.log('Copy operation cancelled by user');
            } else {
                setError(e.message || "An unexpected error occurred during copy.");
            }
        } finally {
            setDownloading(false);
            setCurrentFileName('');
            abortControllerRef.current = null;
        }

    }

    return {
        downloading,
        progress,
        currentFileName,
        downloadToFolder,
        startLocalCopy,
        cancelDownload,
        error
    };
};
