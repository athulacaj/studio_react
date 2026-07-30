import { z } from 'zod';

export const createAlbumsSchema = z.array(z.object({
  imageId: z.string().min(1, 'Image ID is required').max(100),
  linkId: z.string().uuid('Invalid link ID'),
  projectId: z.string().uuid('Invalid project ID'),
  image: z.any(),
  selections: z.array(z.string())
})).min(1, 'At least one album must be provided');

export const getAlbumsSchema = z.object({
  link_id: z.string().uuid('Invalid link ID').optional()
});
