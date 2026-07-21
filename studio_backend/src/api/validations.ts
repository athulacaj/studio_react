import { z } from 'zod';

export const upsertFileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relativePath: z.string(),
  updatedAt: z.string().datetime(),
  deleted: z.boolean().default(false),
});

export const bulkUpsertFilesSchema = z.object({
  files: z.array(upsertFileSchema),
});

export const getFilesQuerySchema = z.object({
  updatedSince: z.string().datetime().optional(),
});

export type UpsertFileDTO = z.infer<typeof upsertFileSchema>;
export type BulkUpsertFilesDTO = z.infer<typeof bulkUpsertFilesSchema>;
export type GetFilesQueryDTO = z.infer<typeof getFilesQuerySchema>;
