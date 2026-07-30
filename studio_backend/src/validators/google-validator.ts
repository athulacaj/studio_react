import { z } from 'zod';

export const getFolderStructureSchema = z.object({
  url: z.string().url().optional(),
  folderId: z.string().optional()
}).refine(data => data.url || data.folderId, {
  message: "Either url or folderId must be provided"
});

export const getDriveTreeSchema = getFolderStructureSchema;

export const uploadDriveDataSchema = z.object({
  url: z.string().url().optional(),
  folderId: z.string().optional(),
  projectId: z.string().uuid("projectId must be a valid UUID").default("default"),
  recursive: z.boolean().optional().default(false)
}).refine(data => data.url || data.folderId, {
  message: "Either url or folderId must be provided"
});

export const exchangeDriveTokenSchema = z.object({
  code: z.string(),
  redirectUri: z.string().url(),
  projectId: z.string().uuid("projectId must be a valid UUID"),
  projectName: z.string()
});

export const listDriveContentsSchema = z.object({
  connectionId: z.string().uuid("connectionId must be a valid UUID"),
  folderId: z.string()
});

export const createDriveFolderSchema = z.object({
  connectionId: z.string().uuid("connectionId must be a valid UUID"),
  parentFolderId: z.string(),
  folderName: z.string()
});

export const uploadToDriveSchema = z.object({
  connectionId: z.string().uuid("connectionId must be a valid UUID"),
  folderId: z.string(),
  fileName: z.string(),
  fileContent: z.string(), // base64 string
  mimeType: z.string()
});

export const revokeDriveAccessSchema = z.object({
  connectionId: z.string().uuid("connectionId must be a valid UUID")
});

export const ensureDriveFolderTreeSchema = z.object({
  connectionId: z.string().uuid("connectionId must be a valid UUID"),
  baseFolderId: z.string(),
  folderPaths: z.array(z.string()).min(1)
});

export const getDriveManifestSchema = z.object({
  connectionId: z.string().uuid("connectionId must be a valid UUID")
});

export const recordDriveUploadsSchema = z.object({
  connectionId: z.string().uuid("connectionId must be a valid UUID"),
  records: z.array(z.object({
    relativePath: z.string(),
    name: z.string().optional(),
    driveFileId: z.string(),
    folderId: z.string().optional(),
    size: z.number().optional(),
    mimeType: z.string().optional()
  })).min(1)
});

export const getDriveAccessTokenSchema = z.object({
  connectionId: z.string().uuid("connectionId must be a valid UUID")
});

