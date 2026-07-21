import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/FileService';

export class FileController {
  constructor(private fileService: FileService = new FileService()) {}

  upsertFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const data = req.body;
      const result = await this.fileService.upsertFile(projectId, data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  bulkUpsertFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const data = req.body;
      await this.fileService.bulkUpsertFiles(projectId, data);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  getFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const { updatedSince } = req.query as { updatedSince?: string };
      const result = await this.fileService.getFiles(projectId, updatedSince);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
