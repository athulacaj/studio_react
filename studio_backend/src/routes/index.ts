import { Router } from 'express';
import fileRoutes from './fileRoutes';
import studioRoutes from './studio';
import tenantRoutes from './tenantRoutes';

const router = Router();

router.use('/projects/:projectId/files', fileRoutes);
router.use('/studio', studioRoutes);
router.use('/', tenantRoutes);

export default router;
