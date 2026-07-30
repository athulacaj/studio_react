import { Router } from 'express';
import { projectController } from '../controllers/ProjectController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth-middleware';
import { createProjectSchema, getProjectsSchema } from '../validators/project-validator';
import { selectedAlbumController } from '../controllers/SelectedAlbumController';
import { createSelectedAlbumSchema, getSelectedAlbumsSchema } from '../validators/selected-album-validator';
import { sharedLinkController } from '../controllers/SharedLinkController';
import { createSharedLinkSchema, getSharedLinksSchema, updateSharedLinkSchema } from '../validators/shared-link-validator';
import { albumController } from '../controllers/AlbumController';
import { createAlbumsSchema, getAlbumsSchema } from '../validators/album-validator';

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
 * /projects/sharedLinks:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a new shared link (Alias)
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
 *                     name:
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
router.post('/sharedLinks', requireAuth, validate(createSharedLinkSchema), sharedLinkController.create);

/**
 * @swagger
 * /projects/sharedLinks:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get shared links (Alias)
 *     description: Retrieves shared links, optionally filtered by id, sourceProjectId, createdBy, or updatedAfter.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional Shared Link ID
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
router.get('/sharedLinks', requireAuth, validate(getSharedLinksSchema, 'query'), sharedLinkController.get);


/**
 * @swagger
 * /projects/sharedLinks/{id}:
 *   put:
 *     tags:
 *       - Projects
 *     summary: Update a shared link
 *     description: Updates an existing shared link for the authenticated user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The shared link ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
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
 *       200:
 *         description: Shared link updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shared link not found
 *       422:
 *         description: Validation error
 */

router.put('/sharedLinks/:id', requireAuth, validate(updateSharedLinkSchema), sharedLinkController.update);

/**
 * @swagger
 * /projects/albums:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create albums in bulk
 *     description: Creates or updates multiple albums for a shared link
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - imageId
 *                 - linkId
 *                 - projectId
 *               properties:
 *                 imageId:
 *                   type: string
 *                 linkId:
 *                   type: string
 *                   format: uuid
 *                 projectId:
 *                   type: string
 *                   format: uuid
 *                 image:
 *                   type: object
 *                 selections:
 *                   type: array
 *                   items:
 *                     type: string
 *     responses:
 *       201:
 *         description: Albums created successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post('/albums', requireAuth, validate(createAlbumsSchema), albumController.create);

/**
 * @swagger
 * /projects/albums:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get albums
 *     description: Retrieves albums, optionally filtered by link_id.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: link_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional Shared Link ID
 *     responses:
 *       200:
 *         description: List of albums
 *       401:
 *         description: Unauthorized
 */
router.get('/albums', requireAuth, validate(getAlbumsSchema, 'query'), albumController.get);


export { router as projectRoutes };

