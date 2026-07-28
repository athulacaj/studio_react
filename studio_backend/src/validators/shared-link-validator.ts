import { z } from 'zod';

export const createSharedLinkSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  sourceProjectId: z.string().uuid('Invalid project ID'),
  categories: z.array(z.object({
    id: z.string(),
    isHidden: z.boolean(),
    label: z.string()
  })).optional(),
  includedFolders: z.array(z.string()).optional(),
});

export const getSharedLinksSchema = z.object({
  sourceProjectId: z.string().uuid('Invalid project ID').optional(),
  createdBy: z.string().uuid('Invalid user ID').optional(),
  updatedAfter: z.string().datetime().optional(),
});
