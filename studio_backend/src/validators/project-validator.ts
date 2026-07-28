import { z } from 'zod';
import { projectAssets, source, projectStatus } from '../db/schema/enums';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  source: z.enum(source.enumValues).optional(),
  status: z.enum(projectStatus.enumValues).optional(),
  projectAssets: z.enum(projectAssets.enumValues).optional(),
  driveUrl: z.string().optional()
});

export const getProjectsSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  updatedAfter: z.string().datetime().optional(),
});
