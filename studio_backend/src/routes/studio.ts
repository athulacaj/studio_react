import { Router } from 'express';
import { StudioController } from '../controllers/StudioContoller';
import { validate } from '../middleware/validate';
import { getUploadUrlSchema } from '../api/validations';

const router = Router({ mergeParams: true });
const studioController = new StudioController();

/**
 * @swagger
 * /studio/upload-url:
 *   post:
 *     summary: Generate a signed upload URL for Cloudflare R2
 *     tags: [Studio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - folder
 *               - fileName
 *             properties:
 *               folder:
 *                 type: string
 *                 description: The folder to upload the file into (e.g., 'images')
 *               fileName:
 *                 type: string
 *                 description: The name of the file to be uploaded
 *               contentType:
 *                 type: string
 *                 description: The MIME type of the file (e.g., 'image/png')
 *     responses:
 *       200:
 *         description: Successfully generated upload URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                   description: The generated object key (path) in the bucket
 *                 uploadUrl:
 *                   type: string
 *                   description: The signed URL to use for uploading the file
 *       400:
 *         description: Validation error
 */
router.post('/upload-url', validate(getUploadUrlSchema, 'body'), studioController.getUploadUrl.bind(studioController));

export default router;
