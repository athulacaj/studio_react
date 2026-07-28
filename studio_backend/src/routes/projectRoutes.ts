import { Router } from 'express';
import { projectController } from '../controllers/ProjectController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth-middleware';
import { createProjectSchema, getProjectsSchema } from '../validators/project-validator';
import { selectedAlbumController } from '../controllers/SelectedAlbumController';
import { createSelectedAlbumSchema, getSelectedAlbumsSchema } from '../validators/selected-album-validator';
import { sharedLinkController } from '../controllers/SharedLinkController';
import { createSharedLinkSchema, getSharedLinksSchema } from '../validators/shared-link-validator';

const router = Router();

/**
 * @swagger
 * /projects/projects:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a new project
 *     description: Creates a new project for the authenticated user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [google_photos, google_drive]
 *               status:
 *                 type: string
 *                 enum: [ready_for_sync, synced, failed, initializing]
 *               projectAssets:
 *                 type: string
 *                 enum: [gdrive, storage]
 *     responses:
 *       201:
 *         description: Project created successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post('/projects', requireAuth, validate(createProjectSchema), projectController.create);

/**
 * @swagger
 * /projects/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get projects
 *     description: Retrieves projects, optionally filtered by userId or updatedAfter, ordered by last updated.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional User ID (if admin)
 *       - in: query
 *         name: updatedAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Return projects updated after this time
 *     responses:
 *       200:
 *         description: List of projects
 *       401:
 *         description: Unauthorized
 */
router.get('/projects', requireAuth, validate(getProjectsSchema, 'query'), projectController.get);


/**
 * @swagger
 * /projects/selected-albums:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a new selected album
 *     description: Creates a new selected album, requires sharedLinkId and optionally accepts id
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sharedLinkId
 *               - name
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               sharedLinkId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               mimeType:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [google_photos, google_drive]
 *               src:
 *                 type: string
 *               url:
 *                 type: string
 *               selections:
 *                 type: object
 *               folderPathList:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Selected album created successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post('/selected-albums', requireAuth, validate(createSelectedAlbumSchema), selectedAlbumController.create);

/**
 * @swagger
 * /projects/selected-albums:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get selected albums
 *     description: Retrieves selected albums, optionally filtered by sharedLinkId or updatedAfter.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: sharedLinkId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional Shared Link ID
 *       - in: query
 *         name: updatedAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Return selected albums updated after this time
 *     responses:
 *       200:
 *         description: List of selected albums
 *       401:
 *         description: Unauthorized
 */
router.get('/selected-albums', requireAuth, validate(getSelectedAlbumsSchema, 'query'), selectedAlbumController.get);



/**
 * @swagger
 * /projects/shared-links:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a new shared link
 *     description: Creates a new shared link for the authenticated user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sourceProjectId
 *             properties:
 *               name:
 *                 type: string
 *               sourceProjectId:
 *                 type: string
 *                 format: uuid
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     isHidden:
 *                       type: boolean
 *                     label:
 *                       type: string
 *               includedFolders:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Shared link created successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post('/shared-links', requireAuth, validate(createSharedLinkSchema), sharedLinkController.create);

/**
 * @swagger
 * /projects/shared-links:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get shared links
 *     description: Retrieves shared links, optionally filtered by sourceProjectId, createdBy, or updatedAfter.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: sourceProjectId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional Project ID
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional User ID (if admin)
 *       - in: query
 *         name: updatedAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Return shared links updated after this time
 *     responses:
 *       200:
 *         description: List of shared links
 *       401:
 *         description: Unauthorized
 */
router.get('/shared-links', requireAuth, validate(getSharedLinksSchema, 'query'), sharedLinkController.get);


export { router as projectRoutes };
