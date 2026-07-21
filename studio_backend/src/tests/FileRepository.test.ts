import { FileRepository } from '../repositories/FileRepository';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('FileRepository', () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let repository: FileRepository;

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    repository = new FileRepository(prismaMock as unknown as PrismaClient);
  });

  describe('upsert', () => {
    it('should call prisma.file.upsert with correct args', async () => {
      const input = {
        id: 'test/path/file.txt',
        projectId: 'p1',
        name: 'file.txt',
        relativePath: 'test/path',
        updatedAt: new Date(),
        deleted: false,
      };

      await repository.upsert(input);

      expect(prismaMock.file.upsert).toHaveBeenCalledWith({
        where: {
          projectId_id: {
            projectId: input.projectId,
            id: input.id,
          },
        },
        update: {
          name: input.name,
          relativePath: input.relativePath,
          updatedAt: input.updatedAt,
          deleted: input.deleted,
        },
        create: input,
      });
    });
  });

  describe('findUpdatedFiles', () => {
    it('should filter by updatedSince', async () => {
      const date = new Date('2026-07-22T08:00:00Z');
      await repository.findUpdatedFiles('p1', date);

      expect(prismaMock.file.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 'p1',
          updatedAt: { gt: date },
        },
        orderBy: { updatedAt: 'asc' },
      });
    });
  });
});
