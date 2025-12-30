import { useState } from 'react';
import { ImageObj } from '../types';
import { usePhotoProofingcontext } from '../context/PhotoProofingContext';

export const useDownloadImages = () => {
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentFileName, setCurrentFileName] = useState('');
    const {
        sourceDirectoryHandle, setSourceDirectoryHandle,
        destinationDirectoryHandle, setDestinationDirectoryHandle
    } = usePhotoProofingcontext();

    /**
     * Downloads images directly to a selected local folder.
     * Uses File System Access API to avoid memory issues with large files (10GB+).
     */
    const downloadToFolder = async (images: ImageObj[], source: 'cloud' | 'local') => {
        if (!images || images.length === 0) return;

        try {
            let destRoot = destinationDirectoryHandle;
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

            if (!destRoot) return;

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

            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const fileName = image.name || `image_${i}.jpg`;
                setCurrentFileName(fileName);

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
                            const imageUrl = image.url || image.src || `https://drive.google.com/uc?export=download&id=${image.id}`;
                            const res = await fetch(imageUrl);
                            if (!res.ok) throw new Error(`Failed to fetch ${fileName}`);

                            if (res.body) {
                                await res.body.pipeTo(writable);
                            } else {
                                const blob = await res.blob();
                                await writable.write(blob);
                            }
                        } else if (source === 'local' && sourceRoot) {
                            // Local to Local copy
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
                                await sourceFile.stream().pipeTo(writable);
                            } catch (localErr) {
                                console.error(`Could not find source file for ${fileName}:`, localErr);
                                await writable.abort();
                                throw localErr;
                            }
                        }

                        try {
                            await writable.close();
                        } catch (e) {
                            // Already closed or aborted
                        }
                    } catch (innerErr) {
                        console.error(`Error during write/copy for ${fileName}:`, innerErr);
                        try {
                            await writable.abort();
                        } catch (e) { /* ignore */ }
                    }
                } catch (err) {
                    console.error(`Error saving ${fileName}:`, err);
                }

                setProgress(Math.round(((i + 1) / images.length) * 100));
            }

            alert(`${source === 'local' ? 'Copy' : 'Download'} complete! All images saved to your folder.`);
        } catch (error) {
            console.error('Folder operation failed:', error);
            if (error instanceof Error && (error.name === 'AbortError' || error.name === 'NotAllowedError')) {
                // User cancelled or denied
            } else if (error instanceof Error) {
                alert(error.message);
            }
        } finally {
            setDownloading(false);
            setProgress(0);
            setCurrentFileName('');
        }
    };

    return {
        downloading,
        progress,
        currentFileName,
        downloadToFolder
    };
};
