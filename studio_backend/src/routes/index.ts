import { Router } from 'express';
import fileRoutes from './fileRoutes';

const router = Router();

router.use('/projects/:projectId/files', fileRoutes);

export default router;
