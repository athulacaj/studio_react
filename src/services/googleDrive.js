
const API_KEY = 'AIzaSyAY1UcT-6e67iALXlIXuYbOXPRshJ6ph48';

export const extractFolderId = (url) => {
    if (!url) return null;
    // Matches patterns like /folders/FOLDER_ID or id=FOLDER_ID
    const patterns = [
        /\/folders\/([a-zA-Z0-9-_]+)/,
        /[?&]id=([a-zA-Z0-9-_]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
};

export const fetchDriveImages = async (folderId) => {
    if (!folderId) return [];

    try {
        // Query to list files in the folder that are images
        const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,thumbnailLink,webContentLink,webViewLink)&key=${API_KEY}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Google Drive API error: ${response.statusText}`);
        }

        
        const data = await response.json();
        
        // Map to a format suitable for the gallery
        return data.files.map(file => {
            // Use the thumbnail endpoint with a large size (sz=w1920) to get a high-res image
            // This method is generally more reliable for public files and avoids some CORS/ORB issues
            // compared to using the raw thumbnailLink or webContentLink directly in some contexts.
            const src = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1920`;
            
            return {
                ...file,
                src: src,
                thumbnailLink: file.thumbnailLink // Keep original just in case
            };
        });
    } catch (error) {
        console.error("Error fetching Drive images:", error);
        throw error;
    }
};
