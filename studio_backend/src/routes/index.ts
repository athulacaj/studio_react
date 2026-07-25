import { Router } from 'express';
import fileRoutes from './fileRoutes';
import studioRoutes from './studio';

const router = Router();

router.use('/projects/:projectId/files', fileRoutes);
router.use('/studio', studioRoutes);

export default router;
