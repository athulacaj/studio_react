import { FileService } from '../services/FileService';
import { FileRepository } from '../repositories/FileRepository';
import { generateFileId } from '../utils/idGenerator';

jest.mock('../repositories/FileRepository');

describe('FileService', () => {
  let fileService: FileService;
  let fileRepository: jest.Mocked<FileRepository>;

  beforeEach(() => {
    fileRepository = new FileRepository() as jest.Mocked<FileRepository>;
    fileService = new FileService(fileRepository);
  });

  describe('upsertFile', () => {
    it('should call repository with correct id and data', async () => {
      const projectId = 'proj-1';
      const input = {
        name: 'test.txt',
        relativePath: 'docs',
        updatedAt: '2026-07-22T08:45:00Z',
        deleted: false,
      };

      await fileService.upsertFile(projectId, input);

      expect(fileRepository.upsert).toHaveBeenCalledWith({
        id: generateFileId(input.relativePath, input.name),
        projectId,
        name: input.name,
        relativePath: input.relativePath,
        updatedAt: new Date(input.updatedAt),
        deleted: input.deleted,
      });
    });
  });

  describe('bulkUpsertFiles', () => {
    it('should call repository bulkUpsert with mapped data', async () => {
      const projectId = 'proj-1';
      const inputs = {
        files: [
          {
            name: 'test1.txt',
            relativePath: 'docs',
            updatedAt: '2026-07-22T08:45:00Z',
            deleted: false,
          },
          {
            name: 'test2.txt',
            relativePath: 'docs/sub',
            updatedAt: '2026-07-22T08:45:00Z',
            deleted: true,
          },
        ],
      };

      await fileService.bulkUpsertFiles(projectId, inputs);

      expect(fileRepository.bulkUpsert).toHaveBeenCalledWith(
        inputs.files.map((file) => ({
          id: generateFileId(file.relativePath, file.name),
          projectId,
          name: file.name,
          relativePath: file.relativePath,
          updatedAt: new Date(file.updatedAt),
          deleted: file.deleted,
        }))
      );
    });
  });

  describe('getFiles', () => {
    it('should call findUpdatedFiles if updatedSince is provided', async () => {
      const projectId = 'proj-1';
      const updatedSince = '2026-07-22T08:45:00Z';
      
      fileRepository.findUpdatedFiles.mockResolvedValue([]);

      await fileService.getFiles(projectId, updatedSince);

      expect(fileRepository.findUpdatedFiles).toHaveBeenCalledWith(
        projectId,
        new Date(updatedSince)
      );
    });

    it('should call findProjectFiles if no updatedSince provided', async () => {
      const projectId = 'proj-1';
      
      fileRepository.findProjectFiles.mockResolvedValue([]);

      await fileService.getFiles(projectId);

      expect(fileRepository.findProjectFiles).toHaveBeenCalledWith(projectId);
    });
  });
});
