import { Router } from 'express';
import { FileController } from '../controllers/FileController';
import { validate } from '../middleware/validate';
import { upsertFileSchema, bulkUpsertFilesSchema, getFilesQuerySchema } from '../api/validations';

/**
 * @swagger
 * components:
 *   schemas:
 *     UpsertFile:
 *       type: object
 *       required:
 *         - name
 *         - relativePath
 *         - updatedAt
 *       properties:
 *         name:
 *           type: string
 *         relativePath:
 *           type: string
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deleted:
 *           type: boolean
 *           default: false
 *         status:
 *           type: string
 *           default: NOT_UPLOADED
 *         url:
 *           type: string
 *           nullable: true
 *     BulkUpsertFiles:
 *       type: object
 *       required:
 *         - files
 *       properties:
 *         files:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UpsertFile'
 */

const router = Router({ mergeParams: true });
const fileController = new FileController();

/**
 * @swagger
 * /projects/{projectId}/files:
 *   post:
 *     summary: Upsert a single file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpsertFile'
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/', validate(upsertFileSchema, 'body'), fileController.upsertFile);

/**
 * @swagger
 * /projects/{projectId}/files/bulk:
 *   post:
 *     summary: Upsert multiple files
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkUpsertFiles'
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/bulk', validate(bulkUpsertFilesSchema, 'body'), fileController.bulkUpsertFiles);

/**
 * @swagger
 * /projects/{projectId}/files:
 *   get:
 *     summary: Get files for a project
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: updatedSince
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', validate(getFilesQuerySchema, 'query'), fileController.getFiles);

export default router;
