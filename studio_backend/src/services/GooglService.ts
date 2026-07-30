import * as crypto from "crypto";
import { env } from "../config/env";
import { googleRepository, GoogleRepository } from "../repositories/GoogleRepository";
import { cloudflareRepository } from "../containers";
import { z } from "zod";
import * as zlib from 'zlib';
import { promisify } from 'util';
const gzip = promisify(zlib.gzip);

const apiKey = env.GOOGLE_DRIVE_API_KEY;
const GOOGLE_DRIVE_CLIENT_ID = env.GOOGLE_DRIVE_CLIENT_ID;
const GOOGLE_DRIVE_CLIENT_SECRET = env.GOOGLE_DRIVE_CLIENT_SECRET;
const TOKEN_ENCRYPTION_KEY = env.TOKEN_ENCRYPTION_KEY || "fallback_encryption_key_32_bytes_";

const ALGORITHM = "aes-256-cbc";

export class GoogleService {
  constructor(private readonly repository: GoogleRepository) { }

  // ─── Token Encryption Helpers ───────────────────────────────────────────────────

  private encryptToken(text: string): string {
    const key = crypto.createHash("sha256").update(TOKEN_ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  private decryptToken(encryptedText: string): string {
    const key = crypto.createHash("sha256").update(TOKEN_ENCRYPTION_KEY).digest();
    const [ivHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  public async getValidAccessToken(connectionId: string): Promise<string> {
    const connectionDoc = await this.repository.getActiveConnection(connectionId);
    if (!connectionDoc) throw new Error("Drive connection not found or inactive");

    const now = new Date();
    const expiry = connectionDoc.tokenExpiry;

    if (expiry.getTime() > now.getTime() + 5 * 60 * 1000) {
      return this.decryptToken(connectionDoc.accessToken);
    }

    const refreshToken = this.decryptToken(connectionDoc.refreshToken);
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
      throw new Error("Failed to refresh Drive access token");
    }

    const tokens = await tokenResponse.json();

    await this.repository.updateDriveConnection(connectionId, {
      accessToken: this.encryptToken(tokens.access_token),
      tokenExpiry: new Date(now.getTime() + tokens.expires_in * 1000),
    });

    return tokens.access_token;
  }

  // ─── Folder Extraction Helpers ────────────────────────────────────────────────

  private extractFolderId(urlOrId: string | undefined): string | null {
    if (!urlOrId) return null;
    const patterns = [
      /\/folders\/([a-zA-Z0-9-_]+)/,
      /[?&]id=([a-zA-Z0-9-_]+)/,
    ];
    for (const pattern of patterns) {
      const match = urlOrId.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return urlOrId;
  }

  // ─── Core Drive Functions ───────────────────────────────────────────────────

  private async fetchFolderContents(folderId: string, recursive: boolean = true) {
    const pageSize = 1000;
    const query = `'${folderId}' in parents and trashed = false`;
    const fields = "nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink, modifiedTime)";

    let allFiles: any[] = [];
    let pageToken = null;

    do {
      let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=${pageSize}&key=${apiKey}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Drive API error: ${response.statusText}`);
      const data = await response.json();

      if (data.files) allFiles = allFiles.concat(data.files);
      pageToken = data.nextPageToken;
    } while (pageToken);

    const folderData: any = {
      id: folderId,
      name: "",
      files: [],
      folders: {},
    };

    const subfolders: any[] = [];
    for (const file of allFiles) {
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

    if (recursive) {
      for (const folder of subfolders) {
        folderData.folders[folder.id] = await this.fetchFolderContents(folder.id, true);
        folderData.folders[folder.id].name = folder.name;
      }
    }

    return folderData;
  }

  private async getDriveTreeFromTargetId(targetId: string, recursive: boolean = true) {
    const rootUrl = `https://www.googleapis.com/drive/v3/files/${targetId}?fields=id,name&key=${apiKey}`;
    const rootResponse = await fetch(rootUrl);

    if (!rootResponse.ok) throw new Error(`Drive API error: ${rootResponse.statusText}`);
    const rootData = await rootResponse.json();

    const tree = await this.fetchFolderContents(targetId, recursive);
    tree.name = rootData.name;
    return tree;
  }

  public async getDriveTree(url?: string, folderId?: string) {
    const targetId = this.extractFolderId(url || folderId);
    if (!targetId) throw new Error("Valid Drive URL or Folder ID is required");
    return await this.getDriveTreeFromTargetId(targetId, true);
  }

  public async uploadDriveData(userId: string, projectId: string, url?: string, folderId?: string, recursive: boolean = false) {
    const targetId = this.extractFolderId(url || folderId);
    if (!targetId) throw new Error("Valid Drive URL or Folder ID is required");

    const tree = await this.getDriveTreeFromTargetId(targetId, recursive);
    const jsonString = JSON.stringify(tree);
    const compressed = await gzip(jsonString);
    const filePath = `${userId}/projects/${projectId}/${targetId}.json.gz`;

    await cloudflareRepository.uploadData(filePath, compressed, "application/json", "gzip");

    await this.repository.updateSyncedFoldersSummary(projectId, targetId, {
      filePath,
      syncTime: new Date().toISOString(),
      filesCount: tree.files.length
    });

    return { success: true, path: filePath };
  }

  private async fetchFolderStructureRecursive(folderId: string) {
    const pageSize = 1000;
    const query = `'${folderId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`;
    const fields = "nextPageToken, files(id, name)";

    let allFolders: any[] = [];
    let pageToken = null;

    do {
      let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=${pageSize}&key=${apiKey}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Drive API error: ${response.statusText}`);
      const data = await response.json();

      if (data.files) allFolders = allFolders.concat(data.files);
      pageToken = data.nextPageToken;
    } while (pageToken);

    const folderData: any = { id: folderId, name: "", folders: {} };

    for (const folder of allFolders) {
      folderData.folders[folder.id] = await this.fetchFolderStructureRecursive(folder.id);
      folderData.folders[folder.id].name = folder.name;
    }

    return folderData;
  }

  public async getFolderStructure(url?: string, folderId?: string) {
    const targetId = this.extractFolderId(url || folderId);
    if (!targetId) throw new Error("Valid Drive URL or Folder ID is required");

    const rootUrl = `https://www.googleapis.com/drive/v3/files/${targetId}?fields=id,name&key=${apiKey}`;
    const rootResponse = await fetch(rootUrl);

    if (!rootResponse.ok) throw new Error(`Drive API error: ${rootResponse.statusText}`);
    const rootData = await rootResponse.json();

    const tree = await this.fetchFolderStructureRecursive(targetId);
    tree.name = rootData.name;
    return tree;
  }

  public async exchangeDriveToken(code: string, redirectUri: string, studioUserId: string, projectId: string, projectName: string) {
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

    if (!tokenResponse.ok) throw new Error("Failed to exchange authorization code");
    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userInfo = await userInfoResponse.json();

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
      const createMizhivResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Mizhiv", mimeType: "application/vnd.google-apps.folder", parents: ["root"] }),
      });
      const mizhivFolder = await createMizhivResponse.json();
      mizhivFolderId = mizhivFolder.id;
    }

    const createProjectFolderResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: projectName, mimeType: "application/vnd.google-apps.folder", parents: [mizhivFolderId] }),
    });
    const projectFolder = await createProjectFolderResponse.json();

    const connectionData = {
      studioUserId,
      projectId,
      googleEmail: userInfo.email || "",
      googleDisplayName: userInfo.name || "",
      accessToken: this.encryptToken(tokens.access_token),
      refreshToken: this.encryptToken(tokens.refresh_token),
      tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      rootFolderId: projectFolder.id,
      rootFolderName: `Mizhiv/${projectName}`,
      status: "active",
    };

    const newConnection = await this.repository.createDriveConnection(connectionData);
    await this.repository.updateProjectDriveConnection(projectId, newConnection.id);

    return {
      success: true,
      connectionId: newConnection.id,
      googleEmail: userInfo.email,
      rootFolderId: projectFolder.id,
      rootFolderName: `Mizhiv/${projectName}`,
    };
  }

  public async listDriveContents(connectionId: string, folderId: string) {
    const accessToken = await this.getValidAccessToken(connectionId);

    const query = `'${folderId}' in parents and trashed = false`;
    const fields = "files(id,name,mimeType,thumbnailLink,webViewLink,size,modifiedTime,createdTime)";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=1000&orderBy=folder,name`;

    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) throw new Error("Failed to list Drive contents");
    const data = await response.json();

    const folderResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=name`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const folderData = await folderResponse.json();

    const files = (data.files || []).map((file: any) => ({
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

    return { files, folderName: folderData.name || "" };
  }

  public async createDriveFolder(connectionId: string, parentFolderId: string, folderName: string) {
    const accessToken = await this.getValidAccessToken(connectionId);

    const response = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: folderName, mimeType: "application/vnd.google-apps.folder", parents: [parentFolderId] }),
    });

    if (!response.ok) throw new Error("Failed to create folder");
    const folder = await response.json();

    return { success: true, folderId: folder.id, folderName: folder.name };
  }

  public async uploadToDrive(connectionId: string, folderId: string, fileName: string, fileContent: string, mimeType: string) {
    const accessToken = await this.getValidAccessToken(connectionId);
    const boundary = "mizhiv_upload_boundary";
    const metadata = JSON.stringify({ name: fileName, parents: [folderId] });
    const fileBuffer = Buffer.from(fileContent, "base64");

    const bodyParts = [
      `--${boundary}\r\n`,
      `Content-Type: application/json; charset=UTF-8\r\n\r\n`,
      metadata,
      `\r\n--${boundary}\r\n`,
      `Content-Type: ${mimeType}\r\n\r\n`,
    ];

    const metadataPart = Buffer.from(bodyParts.join(""));
    const closingBoundary = Buffer.from(`\r\n--${boundary}--`);
    const body = Buffer.concat([metadataPart, fileBuffer, closingBoundary]);

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": body.length.toString(),
      },
      body,
    });

    if (!response.ok) throw new Error("Failed to upload file to Drive");
    const file = await response.json();

    return { success: true, fileId: file.id, fileName: file.name, webViewLink: file.webViewLink || null };
  }

  public async revokeDriveAccess(connectionId: string) {
    const connectionDoc = await this.repository.getActiveConnection(connectionId);
    if (!connectionDoc) throw new Error("Drive connection not found");

    try {
      const accessToken = this.decryptToken(connectionDoc.accessToken);
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
    } catch (e) { }

    await this.repository.updateDriveConnection(connectionId, {
      status: "revoked",
      accessToken: "",
      refreshToken: "",
      revokedAt: new Date(),
    });

    await this.repository.updateProjectDriveConnection(connectionDoc.projectId, null);
    return { success: true };
  }

  private async findFolderByName(accessToken: string, parentId: string, name: string) {
    const q = `name = '${name.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    return data.files && data.files.length ? data.files[0].id : null;
  }

  private async createDriveFolderRaw(accessToken: string, parentId: string, name: string) {
    const res = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] }),
    });
    const folder = await res.json();
    return folder.id;
  }

  private async findOrCreateFolder(accessToken: string, parentId: string, name: string) {
    const existing = await this.findFolderByName(accessToken, parentId, name);
    if (existing) return existing;
    return this.createDriveFolderRaw(accessToken, parentId, name);
  }

  public async ensureDriveFolderTree(connectionId: string, baseFolderId: string, folderPaths: string[]) {
    const accessToken = await this.getValidAccessToken(connectionId);
    const cache: any = { "": baseFolderId };
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
        const id = await this.findOrCreateFolder(accessToken, parentId, seg);
        cache[acc] = id;
        parentId = id;
      }
    }
    return { pathToId: cache };
  }

  public async getDriveAccessToken(connectionId: string) {
    const accessToken = await this.getValidAccessToken(connectionId);
    return { accessToken };
  }
}

export const googleService = new GoogleService(googleRepository);
