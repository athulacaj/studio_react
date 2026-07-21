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
import crypto from "crypto";
import { promisify } from "util";

initializeApp();
const gzip = promisify(zlib.gzip);

const apiKey = process.env.DRIVE_API_KEY;
if (!apiKey) {
  logger.error("DRIVE_API_KEY is not set in environment variables.");
}

// ─── Google Drive OAuth Config ──────────────────────────────────────────────────
const GOOGLE_DRIVE_CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const GOOGLE_DRIVE_CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const TOKEN_ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;

if (!GOOGLE_DRIVE_CLIENT_ID || !GOOGLE_DRIVE_CLIENT_SECRET) {
  logger.warn("Google Drive OAuth credentials not configured. Drive integration functions will fail.");
}

// ─── Token Encryption Helpers ───────────────────────────────────────────────────
const ALGORITHM = "aes-256-cbc";

/**
 * Encrypt a string with AES-256-CBC.
 * Returns "iv:encrypted" hex string.
 */
const encryptToken = (text) => {
  if (!TOKEN_ENCRYPTION_KEY) throw new Error("TOKEN_ENCRYPTION_KEY not set");
  // Derive a 32-byte key from the configured key
  const key = crypto.createHash("sha256").update(TOKEN_ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

/**
 * Decrypt an "iv:encrypted" hex string.
 */
const decryptToken = (encryptedText) => {
  if (!TOKEN_ENCRYPTION_KEY) throw new Error("TOKEN_ENCRYPTION_KEY not set");
  const key = crypto.createHash("sha256").update(TOKEN_ENCRYPTION_KEY).digest();
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

/**
 * Get a valid access token for a Drive connection, refreshing if expired.
 */
const getValidAccessToken = async (connectionDoc) => {
  const data = connectionDoc.data();
  const now = Date.now();
  const expiry = data.tokenExpiry?.toDate?.()?.getTime?.() || 0;

  // If token is still valid (with 5 min buffer), use it
  if (expiry > now + 5 * 60 * 1000) {
    return decryptToken(data.accessToken);
  }

  // Refresh the token
  const refreshToken = decryptToken(data.refreshToken);
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_DRIVE_CLIENT_ID,
      client_secret: GOOGLE_DRIVE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    logger.error("Token refresh failed:", errorBody);
    throw new HttpsError("unauthenticated", "Failed to refresh Drive access token");
  }

  const tokens = await tokenResponse.json();
  const db = getFirestore();

  // Update stored tokens
  await connectionDoc.ref.update({
    accessToken: encryptToken(tokens.access_token),
    tokenExpiry: new Date(now + tokens.expires_in * 1000),
  });

  return tokens.access_token;
};


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
  const pageSize = 1000;
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
        folderData.folders[folder.id] = await fetchFolderContents(folder.id, true);
        folderData.folders[folder.id].name = folder.name; // Assign name here
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
  const { url, folderId, userId, recursive = false, projectId = "default" } = request.data;
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

    await projectRef.update({
      [`syncedFolders.${targetId}`]: {
        filePath,
        syncTime: new Date().toISOString(),
        filesCount: tree.files.length
      }
    });

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
      folderData.folders[folder.id] = await fetchFolderStructureRecursive(folder.id);
      folderData.folders[folder.id].name = folder.name;
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


// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE DRIVE OAUTH INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Exchange an OAuth authorization code for tokens, save them encrypted in Firestore,
 * and create a "Mizhiv/{projectName}" folder in the user's Drive.
 */
export const exchangeDriveToken = onCall(async (request) => {
  const { code, redirectUri, studioUserId, projectId, projectName } = request.data;

  if (!code || !redirectUri || !studioUserId || !projectId || !projectName) {
    throw new HttpsError("invalid-argument", "Missing required fields: code, redirectUri, studioUserId, projectId, projectName");
  }

  if (!GOOGLE_DRIVE_CLIENT_ID || !GOOGLE_DRIVE_CLIENT_SECRET) {
    throw new HttpsError("failed-precondition", "Google Drive OAuth is not configured on the server");
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_DRIVE_CLIENT_ID,
        client_secret: GOOGLE_DRIVE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      logger.error("Token exchange failed:", errorBody);
      throw new HttpsError("unauthenticated", "Failed to exchange authorization code");
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // 2. Get user info from the token
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userInfo = await userInfoResponse.json();

    // 3. Create "Mizhiv" root folder if it doesn't exist
    // First check if a "Mizhiv" folder already exists in the root
    const searchQuery = `name = 'Mizhiv' and mimeType = 'application/vnd.google-apps.folder' and 'root' in parents and trashed = false`;
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchResponse.json();

    let mizhivFolderId;
    if (searchData.files && searchData.files.length > 0) {
      mizhivFolderId = searchData.files[0].id;
    } else {
      // Create "Mizhiv" folder
      const createMizhivResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Mizhiv",
          mimeType: "application/vnd.google-apps.folder",
          parents: ["root"],
        }),
      });
      const mizhivFolder = await createMizhivResponse.json();
      mizhivFolderId = mizhivFolder.id;
    }

    // 4. Create project subfolder inside "Mizhiv"
    const createProjectFolderResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [mizhivFolderId],
      }),
    });
    const projectFolder = await createProjectFolderResponse.json();

    // 5. Save encrypted tokens and connection info to Firestore
    const db = getFirestore();
    const connectionData = {
      studioUserId,
      projectId,
      googleEmail: userInfo.email || "",
      googleDisplayName: userInfo.name || "",
      accessToken: encryptToken(tokens.access_token),
      refreshToken: encryptToken(tokens.refresh_token),
      tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      rootFolderId: projectFolder.id,
      rootFolderName: `Mizhiv/${projectName}`,
      linkedAt: new Date(),
      status: "active",
    };

    const docRef = await db.collection("driveConnections").add(connectionData);

    // 6. Update the project document with the connection reference
    const projectRef = db.doc(`projects/${studioUserId}/projects/${projectId}`);
    await projectRef.update({
      driveConnectionId: docRef.id,
    });

    return {
      success: true,
      connectionId: docRef.id,
      googleEmail: userInfo.email,
      rootFolderId: projectFolder.id,
      rootFolderName: `Mizhiv/${projectName}`,
    };
  } catch (error) {
    logger.error("Error in exchangeDriveToken:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to exchange Drive token", error);
  }
});


/**
 * List files and folders in a specific folder of a connected Drive.
 */
export const listDriveContents = onCall(async (request) => {
  const { connectionId, folderId } = request.data;

  if (!connectionId || !folderId) {
    throw new HttpsError("invalid-argument", "connectionId and folderId are required");
  }

  try {
    const db = getFirestore();
    const connectionDoc = await db.collection("driveConnections").doc(connectionId).get();

    if (!connectionDoc.exists) {
      throw new HttpsError("not-found", "Drive connection not found");
    }

    if (connectionDoc.data().status !== "active") {
      throw new HttpsError("failed-precondition", "Drive connection is not active");
    }

    const accessToken = await getValidAccessToken(connectionDoc);

    // Fetch folder contents
    const query = `'${folderId}' in parents and trashed = false`;
    const fields = "files(id,name,mimeType,thumbnailLink,webViewLink,size,modifiedTime,createdTime)";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=1000&orderBy=folder,name`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error("Drive list error:", errorBody);
      throw new HttpsError("internal", "Failed to list Drive contents");
    }

    const data = await response.json();

    // Get folder name
    const folderResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${folderId}?fields=name`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const folderData = await folderResponse.json();

    const files = (data.files || []).map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      isFolder: file.mimeType === "application/vnd.google-apps.folder",
      thumbnailLink: file.thumbnailLink || null,
      webViewLink: file.webViewLink || null,
      size: file.size || null,
      modifiedTime: file.modifiedTime || null,
      createdTime: file.createdTime || null,
      parentId: folderId,
    }));

    return {
      files,
      folderName: folderData.name || "",
    };
  } catch (error) {
    logger.error("Error in listDriveContents:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to list Drive contents", error);
  }
});


/**
 * Create a new folder in the connected Drive.
 */
export const createDriveFolder = onCall(async (request) => {
  const { connectionId, parentFolderId, folderName } = request.data;

  if (!connectionId || !parentFolderId || !folderName) {
    throw new HttpsError("invalid-argument", "connectionId, parentFolderId, and folderName are required");
  }

  try {
    const db = getFirestore();
    const connectionDoc = await db.collection("driveConnections").doc(connectionId).get();

    if (!connectionDoc.exists) {
      throw new HttpsError("not-found", "Drive connection not found");
    }

    const accessToken = await getValidAccessToken(connectionDoc);

    const response = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error("Create folder error:", errorBody);
      throw new HttpsError("internal", "Failed to create folder");
    }

    const folder = await response.json();

    return {
      success: true,
      folderId: folder.id,
      folderName: folder.name,
    };
  } catch (error) {
    logger.error("Error in createDriveFolder:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to create Drive folder", error);
  }
});


/**
 * Upload a file (base64 encoded) to a specific folder in the connected Drive.
 * Uses multipart upload for efficiency.
 */
export const uploadToDrive = onCall({ maxInstances: 10, timeoutSeconds: 120 }, async (request) => {
  const { connectionId, folderId, fileName, fileContent, mimeType } = request.data;

  if (!connectionId || !folderId || !fileName || !fileContent || !mimeType) {
    throw new HttpsError("invalid-argument", "connectionId, folderId, fileName, fileContent, and mimeType are required");
  }

  try {
    const db = getFirestore();
    const connectionDoc = await db.collection("driveConnections").doc(connectionId).get();

    if (!connectionDoc.exists) {
      throw new HttpsError("not-found", "Drive connection not found");
    }

    const accessToken = await getValidAccessToken(connectionDoc);

    // Build multipart body for upload
    const boundary = "mizhiv_upload_boundary";
    const metadata = JSON.stringify({
      name: fileName,
      parents: [folderId],
    });

    const fileBuffer = Buffer.from(fileContent, "base64");

    const bodyParts = [
      `--${boundary}\r\n`,
      `Content-Type: application/json; charset=UTF-8\r\n\r\n`,
      metadata,
      `\r\n--${boundary}\r\n`,
      `Content-Type: ${mimeType}\r\n\r\n`,
    ];

    // Construct the body as a Buffer
    const metadataPart = Buffer.from(bodyParts.join(""));
    const closingBoundary = Buffer.from(`\r\n--${boundary}--`);
    const body = Buffer.concat([metadataPart, fileBuffer, closingBoundary]);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": body.length.toString(),
        },
        body,
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error("Upload error:", errorBody);
      throw new HttpsError("internal", "Failed to upload file to Drive");
    }

    const file = await response.json();

    return {
      success: true,
      fileId: file.id,
      fileName: file.name,
      webViewLink: file.webViewLink || null,
    };
  } catch (error) {
    logger.error("Error in uploadToDrive:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to upload file to Drive", error);
  }
});


/**
 * Revoke Drive access: revoke the token with Google and mark connection as revoked.
 */
export const revokeDriveAccess = onCall(async (request) => {
  const { connectionId } = request.data;

  if (!connectionId) {
    throw new HttpsError("invalid-argument", "connectionId is required");
  }

  try {
    const db = getFirestore();
    const connectionRef = db.collection("driveConnections").doc(connectionId);
    const connectionDoc = await connectionRef.get();

    if (!connectionDoc.exists) {
      throw new HttpsError("not-found", "Drive connection not found");
    }

    const data = connectionDoc.data();

    // Try to revoke the token with Google (best effort)
    try {
      const accessToken = decryptToken(data.accessToken);
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
    } catch (revokeError) {
      logger.warn("Token revocation with Google failed (non-critical):", revokeError);
    }

    // Mark as revoked in Firestore
    await connectionRef.update({
      status: "revoked",
      accessToken: "",
      refreshToken: "",
      revokedAt: new Date(),
    });

    // Remove connection reference from project
    if (data.studioUserId && data.projectId) {
      const projectRef = db.doc(`projects/${data.studioUserId}/projects/${data.projectId}`);
      await projectRef.update({
        driveConnectionId: null,
      });
    }

    return { success: true };
  } catch (error) {
    logger.error("Error in revokeDriveAccess:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to revoke Drive access", error);
  }
});


// ═══════════════════════════════════════════════════════════════════════════════
// FOLDER SYNC + UPLOAD TRACKING ("DB" MANIFEST)
// ═══════════════════════════════════════════════════════════════════════════════

const MIZHIV_SYSTEM_FOLDER = ".mizhiv";
const MANIFEST_FILE_NAME = "manifest.json";

/** Escape single quotes for Drive `q` search strings. */
const escapeDriveQuery = (value) => String(value).replace(/'/g, "\\'");

/** Find a subfolder by exact name under a parent (only sees app-created files under drive.file scope). */
const findFolderByName = async (accessToken, parentId, name) => {
  const q = `name = '${escapeDriveQuery(name)}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    logger.error("Drive folder search failed:", await res.text());
    throw new HttpsError("internal", "Failed to search Drive folders");
  }
  const data = await res.json();
  return data.files && data.files.length ? data.files[0].id : null;
};

/** Create a folder under a parent, optionally tagging it with private appProperties. */
const createDriveFolderRaw = async (accessToken, parentId, name, appProperties) => {
  const body = { name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] };
  if (appProperties) body.appProperties = appProperties;
  const res = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    logger.error("Create folder failed:", await res.text());
    throw new HttpsError("internal", "Failed to create Drive folder");
  }
  const folder = await res.json();
  return folder.id;
};

/** Reuse an existing subfolder if present, otherwise create it. */
const findOrCreateFolder = async (accessToken, parentId, name, appProperties) => {
  const existing = await findFolderByName(accessToken, parentId, name);
  if (existing) return existing;
  return createDriveFolderRaw(accessToken, parentId, name, appProperties);
};

/**
 * Write (or refresh) the in-Drive tracking manifest at `{root}/.mizhiv/manifest.json`.
 * Self-healing: if the .mizhiv folder or manifest file was deleted, it is recreated.
 */
const writeManifestFile = async (accessToken, rootFolderId, files) => {
  const mizhivFolderId = await findOrCreateFolder(accessToken, rootFolderId, MIZHIV_SYSTEM_FOLDER, {
    mizhivSystem: "true",
  });

  const manifest = {
    app: "Mizhiv",
    version: 1,
    note: "Auto-generated by Mizhiv to track synced photos. Do not edit or delete — it will be regenerated.",
    updatedAt: new Date().toISOString(),
    fileCount: files.length,
    files: files.map((f) => ({
      relativePath: f.relativePath,
      name: f.name,
      driveFileId: f.driveFileId,
      folderId: f.folderId,
      size: typeof f.size === "number" ? f.size : null,
      mimeType: f.mimeType || null,
    })),
  };
  const content = JSON.stringify(manifest, null, 2);

  // Locate an existing manifest.json in the .mizhiv folder
  const q = `name = '${escapeDriveQuery(MANIFEST_FILE_NAME)}' and '${mizhivFolderId}' in parents and trashed = false`;
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchRes.json();
  const existingId = searchData.files && searchData.files.length ? searchData.files[0].id : null;

  if (existingId) {
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: content,
      }
    );
    if (!res.ok) logger.error("Manifest update failed:", await res.text());
    return { mizhivFolderId, manifestFileId: existingId };
  }

  const boundary = "mizhiv_manifest_boundary";
  const metadata = JSON.stringify({
    name: MANIFEST_FILE_NAME,
    parents: [mizhivFolderId],
    mimeType: "application/json",
    appProperties: { mizhivManifest: "true" },
  });
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    }
  );
  if (!res.ok) {
    logger.error("Manifest create failed:", await res.text());
    return { mizhivFolderId, manifestFileId: null };
  }
  const created = await res.json();
  return { mizhivFolderId, manifestFileId: created.id };
};

/** Load + validate an active Drive connection, returning the doc snapshot. */
const getActiveConnectionDoc = async (connectionId) => {
  const db = getFirestore();
  const connDoc = await db.collection("driveConnections").doc(connectionId).get();
  if (!connDoc.exists) throw new HttpsError("not-found", "Drive connection not found");
  if (connDoc.data().status !== "active") {
    throw new HttpsError("failed-precondition", "Drive connection is not active");
  }
  return connDoc;
};

/**
 * Recreate a set of relative folder paths under a base folder, reusing folders that
 * already exist. Returns a map of relativePath -> Drive folder id (including "" -> base).
 */
export const ensureDriveFolderTree = onCall({ timeoutSeconds: 300 }, async (request) => {
  const { connectionId, baseFolderId, folderPaths } = request.data;

  if (!connectionId || !baseFolderId || !Array.isArray(folderPaths)) {
    throw new HttpsError("invalid-argument", "connectionId, baseFolderId, and folderPaths[] are required");
  }

  try {
    const connDoc = await getActiveConnectionDoc(connectionId);
    const accessToken = await getValidAccessToken(connDoc);

    // Cache of already-resolved paths; "" is the base folder itself.
    const cache = { "": baseFolderId };

    // Create shallower paths first so parents always exist before children.
    const sorted = [...new Set(folderPaths.filter((p) => typeof p === "string" && p.length))].sort(
      (a, b) => a.split("/").length - b.split("/").length
    );

    for (const path of sorted) {
      const segments = path.split("/");
      let parentId = baseFolderId;
      let acc = "";
      for (const seg of segments) {
        if (!seg) continue;
        acc = acc ? `${acc}/${seg}` : seg;
        if (cache[acc]) {
          parentId = cache[acc];
          continue;
        }
        const id = await findOrCreateFolder(accessToken, parentId, seg);
        cache[acc] = id;
        parentId = id;
      }
    }

    return { pathToId: cache };
  } catch (error) {
    logger.error("Error in ensureDriveFolderTree:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to ensure Drive folder tree");
  }
});

/**
 * Return the tracking records of everything already synced for a connection.
 * The app uses this to skip files that were uploaded before.
 */
export const getDriveManifest = onCall(async (request) => {
  const { connectionId } = request.data;

  if (!connectionId) {
    throw new HttpsError("invalid-argument", "connectionId is required");
  }

  try {
    const db = getFirestore();
    const connRef = db.collection("driveConnections").doc(connectionId);
    const connDoc = await connRef.get();
    if (!connDoc.exists) throw new HttpsError("not-found", "Drive connection not found");

    const snap = await connRef.collection("syncedFiles").get();
    const files = snap.docs.map((d) => {
      const data = d.data();
      return {
        relativePath: data.relativePath,
        name: data.name,
        driveFileId: data.driveFileId,
        folderId: data.folderId,
        size: typeof data.size === "number" ? data.size : null,
        mimeType: data.mimeType || null,
        syncedAt: data.syncedAt?.toDate?.()?.toISOString?.() || null,
      };
    });

    return { files };
  } catch (error) {
    logger.error("Error in getDriveManifest:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to get Drive manifest");
  }
});

/**
 * Persist upload records to Firestore (source of truth) and mirror them into the
 * self-healing in-Drive manifest file.
 */
export const recordDriveUploads = onCall({ timeoutSeconds: 120 }, async (request) => {
  const { connectionId, records } = request.data;

  if (!connectionId || !Array.isArray(records) || records.length === 0) {
    throw new HttpsError("invalid-argument", "connectionId and a non-empty records[] are required");
  }

  try {
    const db = getFirestore();
    const connRef = db.collection("driveConnections").doc(connectionId);
    const connDoc = await connRef.get();
    if (!connDoc.exists) throw new HttpsError("not-found", "Drive connection not found");

    const rootFolderId = connDoc.data().rootFolderId;
    const col = connRef.collection("syncedFiles");

    // Batch writes (deterministic id per relativePath keeps re-syncs idempotent).
    let batch = db.batch();
    let ops = 0;
    for (const r of records) {
      if (!r || !r.relativePath || !r.driveFileId) continue;
      const id = crypto.createHash("sha1").update(r.relativePath).digest("hex");
      batch.set(
        col.doc(id),
        {
          relativePath: r.relativePath,
          name: r.name || r.relativePath.split("/").pop(),
          driveFileId: r.driveFileId,
          folderId: r.folderId || rootFolderId,
          size: typeof r.size === "number" ? r.size : null,
          mimeType: r.mimeType || null,
          syncedAt: new Date(),
        },
        { merge: true }
      );
      if (++ops >= 450) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
    if (ops > 0) await batch.commit();

    // Read the full set once for the count and the manifest mirror.
    const allSnap = await col.get();
    const allFiles = allSnap.docs.map((d) => d.data());

    await connRef.update({ lastSyncedAt: new Date(), syncedFileCount: allFiles.length });

    // Regenerate the in-Drive manifest (best-effort, self-healing).
    let manifestInfo = { mizhivFolderId: null, manifestFileId: null };
    try {
      const accessToken = await getValidAccessToken(connDoc);
      manifestInfo = await writeManifestFile(accessToken, rootFolderId, allFiles);
    } catch (mErr) {
      logger.warn("Failed to write in-Drive manifest (non-critical):", mErr);
    }

    return { success: true, syncedFileCount: allFiles.length, ...manifestInfo };
  } catch (error) {
    logger.error("Error in recordDriveUploads:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to record Drive uploads");
  }
});
