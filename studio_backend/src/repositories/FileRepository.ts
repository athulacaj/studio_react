import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../prisma/client';

export class FileRepository {
  private db: PrismaClient;

  constructor(dbClient: PrismaClient = prisma) {
    this.db = dbClient;
  }

  async upsert(data: Prisma.FileUncheckedCreateInput) {
    return this.db.file.upsert({
      where: {
        projectId_id: {
          projectId: data.projectId,
          id: data.id,
        },
      },
      update: {
        name: data.name,
        relativePath: data.relativePath,
        updatedAt: data.updatedAt,
        deleted: data.deleted,
        // modifiedAt is automatically updated by Prisma @updatedAt
      },
      create: data,
    });
  }

  async bulkUpsert(files: Prisma.FileUncheckedCreateInput[]) {
    // We run individual upserts inside a transaction for SQLite.
    // Prisma SQLite doesn't support bulk upsert natively, so we map to multiple upserts.
    const ops = files.map((file) =>
      this.db.file.upsert({
        where: {
          projectId_id: {
            projectId: file.projectId,
            id: file.id,
          },
        },
        update: {
          name: file.name,
          relativePath: file.relativePath,
          updatedAt: file.updatedAt,
          deleted: file.deleted,
        },
        create: file,
      })
    );
    return this.db.$transaction(ops);
  }

  async findProjectFiles(projectId: string) {
    return this.db.file.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'asc' },
    });
  }

  async findUpdatedFiles(projectId: string, updatedSince: Date) {
    return this.db.file.findMany({
      where: {
        projectId,
        updatedAt: {
          gt: updatedSince,
        },
      },
      orderBy: { updatedAt: 'asc' },
    });
  }
}
