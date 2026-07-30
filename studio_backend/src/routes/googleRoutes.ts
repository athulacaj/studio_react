import { Router } from 'express';
import { googleController } from '../controllers/GoogleController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth-middleware';
import {
  getFolderStructureSchema,
  getDriveTreeSchema,
  uploadDriveDataSchema,
  exchangeDriveTokenSchema,
  listDriveContentsSchema,
  createDriveFolderSchema,
  uploadToDriveSchema,
  revokeDriveAccessSchema,
  ensureDriveFolderTreeSchema,
  getDriveAccessTokenSchema
} from '../validators/google-validator';

const router = Router();

/**
 * @swagger
 * /google/folder-structure:
 *   post:
 *     tags:
 *       - Google
 *     summary: Get Google Drive folder structure
 *     description: Retrieves the recursive folder structure of a Google Drive folder using either its URL or ID.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               folderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Folder structure retrieved successfully
 *       400:
 *         description: Invalid argument
 */
router.post('/folder-structure', requireAuth, validate(getFolderStructureSchema), googleController.getFolderStructure);

/**
 * @swagger
 * /google/drive-tree:
 *   post:
 *     tags:
 *       - Google
 *     summary: Get Drive tree
 *     description: Retrieves a full recursive file and folder tree from Drive.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               folderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tree retrieved successfully
 */
router.post('/drive-tree', requireAuth, validate(getDriveTreeSchema), googleController.getDriveTree);

/**
 * @swagger
 * /google/upload-drive-data:
 *   post:
 *     tags:
 *       - Google
 *     summary: Upload Drive data to R2
 *     description: Fetches the drive tree and uploads it as a compressed JSON to Cloudflare R2.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               folderId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               recursive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Data uploaded successfully
 */
router.post('/upload-drive-data', requireAuth, validate(uploadDriveDataSchema), googleController.uploadDriveData);

/**
 * @swagger
 * /google/exchange-token:
 *   post:
 *     tags:
 *       - Google
 *     summary: Exchange Drive OAuth Token
 *     description: Exchange authorization code for tokens and store securely.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               redirectUri:
 *                 type: string
 *               projectId:
 *                 type: string
 *               projectName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token exchanged successfully
 */
router.post('/exchange-token', requireAuth, validate(exchangeDriveTokenSchema), googleController.exchangeDriveToken);

/**
 * @swagger
 * /google/list-contents:
 *   post:
 *     tags:
 *       - Google
 *     summary: List Drive Contents
 *     description: List files and folders in a specific Drive folder.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               connectionId:
 *                 type: string
 *               folderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contents retrieved successfully
 */
router.post('/list-contents', requireAuth, validate(listDriveContentsSchema), googleController.listDriveContents);

/**
 * @swagger
 * /google/create-folder:
 *   post:
 *     tags:
 *       - Google
 *     summary: Create Drive Folder
 *     description: Creates a new folder in Google Drive.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               connectionId:
 *                 type: string
 *               parentFolderId:
 *                 type: string
 *               folderName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Folder created successfully
 */
router.post('/create-folder', requireAuth, validate(createDriveFolderSchema), googleController.createDriveFolder);

/**
 * @swagger
 * /google/upload-to-drive:
 *   post:
 *     tags:
 *       - Google
 *     summary: Upload to Drive
 *     description: Uploads a base64 encoded file to Drive.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               connectionId:
 *                 type: string
 *               folderId:
 *                 type: string
 *               fileName:
 *                 type: string
 *               fileContent:
 *                 type: string
 *               mimeType:
 *                 type: string
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post('/upload-to-drive', requireAuth, validate(uploadToDriveSchema), googleController.uploadToDrive);

/**
 * @swagger
 * /google/revoke-access:
 *   post:
 *     tags:
 *       - Google
 *     summary: Revoke Drive Access
 *     description: Revokes Google Drive access token.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               connectionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access revoked successfully
 */
router.post('/revoke-access', requireAuth, validate(revokeDriveAccessSchema), googleController.revokeDriveAccess);

/**
 * @swagger
 * /google/ensure-folder-tree:
 *   post:
 *     tags:
 *       - Google
 *     summary: Ensure Drive Folder Tree
 *     description: Recreates a set of relative folder paths in Drive.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               connectionId:
 *                 type: string
 *               baseFolderId:
 *                 type: string
 *               folderPaths:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tree ensured successfully
 */
router.post('/ensure-folder-tree', requireAuth, validate(ensureDriveFolderTreeSchema), googleController.ensureDriveFolderTree);

/**
 * @swagger
 * /google/access-token:
 *   post:
 *     tags:
 *       - Google
 *     summary: Get Drive Access Token
 *     description: Returns a short-lived Google Drive access token.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               connectionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token retrieved successfully
 */
router.post('/access-token', requireAuth, validate(getDriveAccessTokenSchema), googleController.getDriveAccessToken);

export { router as googleRoutes };
