import { Router } from 'express';
import fileRoutes from './fileRoutes';
import studioRoutes from './studio';
import { baseRoutes, tenantRoutes } from './tenantRoutes';
import { authRouter } from './authRoutes';
import { projectRoutes } from './projectRoutes';
import { googleRoutes } from './googleRoutes';

const router = Router();

router.use('/projects/:projectId/files', fileRoutes);
router.use('/projects', projectRoutes);
router.use('/studio', studioRoutes);
router.use('/', baseRoutes);
router.use('/tenant', tenantRoutes);
router.use('/auth', authRouter);
router.use('/google', googleRoutes);


export default router;
