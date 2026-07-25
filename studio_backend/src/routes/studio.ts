import { Router } from 'express';
import { FileController } from '../controllers/FileController';
import { validate } from '../middleware/validate';
import { upsertFileSchema, bulkUpsertFilesSchema, getFilesQuerySchema } from '../api/validations';

const router = Router({ mergeParams: true });
const fileController = new FileController();

router.post('/', validate(upsertFileSchema, 'body'), fileController.upsertFile);
router.post('/bulk', validate(bulkUpsertFilesSchema, 'body'), fileController.bulkUpsertFiles);
router.get('/', validate(getFilesQuerySchema, 'query'), fileController.getFiles);

export default router;
