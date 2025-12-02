/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

/* eslint-env node */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import dotenv from "dotenv";
import functions from 'firebase-functions';
dotenv.config();

import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import zlib from "zlib";
import { promisify } from "util";

initializeApp();
const gzip = promisify(zlib.gzip);

const apiKey = process.env.DRIVE_API_KEY;
if (!apiKey) {
  logger.error("DRIVE_API_KEY is not set in environment variables.");
}


// Helper to extract folder ID from URL
const extractFolderId = (url) => {
  if (!url) return null;
  const patterns = [
    /\/folders\/([a-zA-Z0-9-_]+)/,
    /[?&]id=([a-zA-Z0-9-_]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Recursive function to fetch folder contents
const fetchFolderContents = async (folderId, recursive = true) => {
  const pageSize=1000;
  try {
    // Fetch all files and folders in the current folder
    const query = `'${folderId}' in parents and trashed = false`;
    const fields = "nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink, modifiedTime)";
    
    let allFiles = [];
    let pageToken = null;

    do {
      let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=${pageSize}&key=${apiKey}`;
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Drive API error: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.files) {
        allFiles = allFiles.concat(data.files);
      }
      pageToken = data.nextPageToken; 
    } while (pageToken);

    const files = allFiles;
    const folderData = {
      id: folderId,
      name: "", // We might need to fetch the folder's name separately if not passed
      files: [],
      folders: {},
    };

    // Separate files and subfolders
    const subfolders = [];
    for (const file of files) {
      if (file.mimeType === "application/vnd.google-apps.folder") {
        subfolders.push(file);
      } else {
        folderData.files.push({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          url: file.webViewLink,
          thumbnail: file.thumbnailLink,
          modifiedTime: file.modifiedTime,
        });
      }
    }

    // Recursively fetch subfolders
    if (recursive) {
      for (const folder of subfolders) {
        folderData.folders[folder.name] = await fetchFolderContents(folder.id, true);
        folderData.folders[folder.name].name = folder.name; // Assign name here
      }
    }

    return folderData;
  } catch (error) {
    logger.error("Error fetching folder contents:", error);
    throw new HttpsError("internal", "Failed to fetch Drive contents", error);
  }
};

async function getDriveTreeFromTargetId(targetId, recursive = true) {
    // Fetch root folder name first
    const rootUrl = `https://www.googleapis.com/drive/v3/files/${targetId}?fields=id,name&key=${apiKey}`;
    const rootResponse = await fetch(rootUrl);
    
    if (!rootResponse.ok) {
       throw new Error(`Drive API error: ${rootResponse.statusText}`);
    }
    
    const rootData = await rootResponse.json();
    
    const tree = await fetchFolderContents(targetId, recursive);
    tree.name = rootData.name;
    
    return tree;
  
}

export const getDriveTree = onCall(async (request) => {
  const { url, folderId } = request.data;
  let targetId = folderId;

  if (url) {
    targetId = extractFolderId(url);
  }

  if (!targetId) {
    throw new HttpsError("invalid-argument", "Valid Drive URL or Folder ID is required");
  }

  try {
    const tree = await getDriveTreeFromTargetId(targetId, true);
    return tree;
  } catch (error) {
    logger.error("Error in getDriveTree:", error);
    throw new HttpsError("internal", "Failed to process Drive request", error);
  }
});




export const uploadDriveData = onCall(async (request) => {
  const { url, folderId, userId,recursive = false,projectId="default" } = request.data;
  const uid = request.auth?.uid || userId;

  if (!uid) {
    throw new HttpsError("unauthenticated", "User must be authenticated or provide a userId");
  }

  let targetId = folderId;

  if (url) {
    targetId = extractFolderId(url);
  }

  if (!targetId) {
    throw new HttpsError("invalid-argument", "Valid Drive URL or Folder ID is required");
  }

  try {
    const tree = await getDriveTreeFromTargetId(targetId, recursive);


    const jsonString = JSON.stringify(tree);
    const compressed = await gzip(jsonString);

    const bucket = getStorage().bucket();
    const filePath = `${uid}/projects/${projectId}/${targetId}.json.gz`;
    const file = bucket.file(filePath);

    await file.save(compressed, {
      metadata: {
        contentType: 'application/json',
        contentEncoding: 'gzip',
        metadata: {
          gzip: 'true'
        }
      }
    });

    const db = getFirestore();
    const projectRef = db.doc(`projects/${uid}/projects/${projectId}`);
    
    await projectRef.set({
      [targetId]: {
        filePath: filePath,
        syncTime: new Date().toISOString(),
        filesCount: tree.files.length
      }
    }, { merge: true });

    return { success: true, path: filePath };

  } catch (error) {
    logger.error("Error in uploadDriveData:", error);
    throw new HttpsError("internal", "Failed to process and upload Drive data", error);
  }
});

// Recursive function to fetch ONLY folder structure
const fetchFolderStructureRecursive = async (folderId) => {
  const pageSize = 1000;
  try {
    // Fetch only folders in the current folder
    const query = `'${folderId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`;
    const fields = "nextPageToken, files(id, name)";
    
    let allFolders = [];
    let pageToken = null;

    do {
      let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=${pageSize}&key=${apiKey}`;
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Drive API error: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.files) {
        allFolders = allFolders.concat(data.files);
      }
      pageToken = data.nextPageToken; 
    } while (pageToken);

    const folderData = {
      id: folderId,
      name: "", // Will be populated by parent or initial call
      folders: {},
    };

    // Recursively fetch subfolders
    for (const folder of allFolders) {
      folderData.folders[folder.name] = await fetchFolderStructureRecursive(folder.id);
      folderData.folders[folder.name].name = folder.name;
    }

    return folderData;
  } catch (error) {
    logger.error("Error fetching folder structure:", error);
    throw new HttpsError("internal", "Failed to fetch Drive folder structure", error);
  }
};

export const getFolderStructure = onCall(async (request) => {
  const { url, folderId } = request.data;
  let targetId = folderId;

  if (url) {
    targetId = extractFolderId(url);
  }

  if (!targetId) {
    throw new HttpsError("invalid-argument", "Valid Drive URL or Folder ID is required");
  }

  try {
    // Fetch root folder name first
    const rootUrl = `https://www.googleapis.com/drive/v3/files/${targetId}?fields=id,name&key=${apiKey}`;
    const rootResponse = await fetch(rootUrl);
    
    if (!rootResponse.ok) {
       throw new Error(`Drive API error: ${rootResponse.statusText}`);
    }
    
    const rootData = await rootResponse.json();
    
    const tree = await fetchFolderStructureRecursive(targetId);
    tree.name = rootData.name;
    
    return tree;
  } catch (error) {
    logger.error("Error in getFolderStructure:", error);
    throw new HttpsError("internal", "Failed to process Drive request", error);
  }
});

