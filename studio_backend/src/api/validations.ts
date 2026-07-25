import { z } from 'zod';

export const upsertFileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relativePath: z.string(),
  updatedAt: z.string().datetime(),
  deleted: z.boolean().default(false),
  status: z.string().optional().default('NOT_UPLOADED'),
  url: z.string().optional().nullable(),
});

export const bulkUpsertFilesSchema = z.object({
  files: z.array(upsertFileSchema),
});

export const getFilesQuerySchema = z.object({
  updatedSince: z.string().datetime().optional(),
});

export const getUploadUrlSchema = z.object({
  folder: z.string().min(1, 'Folder is required'),
  fileName: z.string().min(1, 'FileName is required'),
  contentType: z.string().optional(),
});

export type UpsertFileDTO = z.infer<typeof upsertFileSchema>;
export type BulkUpsertFilesDTO = z.infer<typeof bulkUpsertFilesSchema>;
export type GetFilesQueryDTO = z.infer<typeof getFilesQuerySchema>;
export type GetUploadUrlDTO = z.infer<typeof getUploadUrlSchema>;
