import { FileRepository } from '../repositories/FileRepository';
import { UpsertFileDTO, BulkUpsertFilesDTO } from '../api/validations';
import { generateFileId } from '../utils/idGenerator';
import { Prisma } from '@prisma/client';

export class FileService {
  constructor(private fileRepository: FileRepository = new FileRepository()) {}

  async upsertFile(projectId: string, data: UpsertFileDTO) {
    const id = generateFileId(data.relativePath, data.name);
    
    const input: Prisma.FileUncheckedCreateInput = {
      id,
      projectId,
      name: data.name,
      relativePath: data.relativePath,
      updatedAt: new Date(data.updatedAt),
      deleted: data.deleted,
    };

    return this.fileRepository.upsert(input);
  }

  async bulkUpsertFiles(projectId: string, data: BulkUpsertFilesDTO) {
    const inputs: Prisma.FileUncheckedCreateInput[] = data.files.map((file) => ({
      id: generateFileId(file.relativePath, file.name),
      projectId,
      name: file.name,
      relativePath: file.relativePath,
      updatedAt: new Date(file.updatedAt),
      deleted: file.deleted,
    }));

    return this.fileRepository.bulkUpsert(inputs);
  }

  async getFiles(projectId: string, updatedSince?: string) {
    let files;
    if (updatedSince) {
      files = await this.fileRepository.findUpdatedFiles(projectId, new Date(updatedSince));
    } else {
      files = await this.fileRepository.findProjectFiles(projectId);
    }
    
    return {
      projectId,
      lastSync: new Date().toISOString(),
      files,
    };
  }
}
