import { Router } from 'express';
import fileRoutes from './fileRoutes';
import studioRoutes from './studio';
import { baseRoutes, tenantRoutes } from './tenantRoutes';

const router = Router();

router.use('/projects/:projectId/files', fileRoutes);
router.use('/studio', studioRoutes);
router.use('/', baseRoutes);
router.use('/tenant', tenantRoutes);

export default router;
