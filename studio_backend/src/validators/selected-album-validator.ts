import { z } from 'zod';
import { source } from '../db/schema/enums';

export const createSelectedAlbumSchema = z.object({
  id: z.string().uuid('Invalid ID').optional(),
  sharedLinkId: z.string().uuid('Invalid shared link ID'),
  name: z.string().min(1, 'Name is required').max(255),
  mimeType: z.string().max(255).optional(),
  source: z.enum(source.enumValues).optional(),
  src: z.string().optional(),
  url: z.string().optional(),
  selections: z.any().optional(),
  folderPathList: z.array(z.string()).optional(),
});

export const getSelectedAlbumsSchema = z.object({
  sharedLinkId: z.string().uuid('Invalid shared link ID').optional(),
  updatedAfter: z.string().datetime().optional(),
});
