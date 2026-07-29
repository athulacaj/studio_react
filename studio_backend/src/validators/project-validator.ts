import { z } from 'zod';
import { projectAssets, source, projectStatus } from '../db/schema/enums';

const projectDataSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  source: z.enum(source.enumValues).optional(),
  status: z.enum(projectStatus.enumValues).optional(),
  projectAssets: z.enum(projectAssets.enumValues).optional(),
  driveUrl: z.string().optional()
});

const driveDataSchema = z.object({
  driveData: z.any().optional(),
  selectedFolders: z.array(z.string()).optional()
}).optional();

export const createProjectSchema = z.object({
  project: projectDataSchema,
  driveData: driveDataSchema
});

export const getProjectsSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  updatedAfter: z.string().datetime().optional(),
});
