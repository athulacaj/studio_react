import { Request, Response, NextFunction } from 'express';
import { googleService } from '../services/GooglService';

class GoogleController {
  public getFolderStructure = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await googleService.getFolderStructure(req.body.url, req.body.folderId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error.message === 'Valid Drive URL or Folder ID is required') {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  public getDriveTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await googleService.getDriveTree(req.body.url, req.body.folderId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }

  public uploadDriveData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url, folderId, projectId, recursive } = req.body;
      const userId = (req as any).user?.userId; // Assuming requireAuth populates req.user.userId
      if (!userId) {
        res.status(401).json({ success: false, error: "Unauthenticated" });
        return;
      }
      const data = await googleService.uploadDriveData(userId, projectId, url, folderId, recursive);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }

  public exchangeDriveToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, redirectUri, projectId, projectName } = req.body;
      const studioUserId = (req as any).user?.userId;
      if (!studioUserId) {
        res.status(401).json({ success: false, error: "Unauthenticated" });
        return;
      }
      const data = await googleService.exchangeDriveToken(code, redirectUri, studioUserId, projectId, projectName);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }

  public listDriveContents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { connectionId, folderId } = req.body;
      const data = await googleService.listDriveContents(connectionId, folderId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }

  public createDriveFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { connectionId, parentFolderId, folderName } = req.body;
      const data = await googleService.createDriveFolder(connectionId, parentFolderId, folderName);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }

  public uploadToDrive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { connectionId, folderId, fileName, fileContent, mimeType } = req.body;
      const data = await googleService.uploadToDrive(connectionId, folderId, fileName, fileContent, mimeType);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }

  public revokeDriveAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { connectionId } = req.body;
      const data = await googleService.revokeDriveAccess(connectionId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }

  public ensureDriveFolderTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { connectionId, baseFolderId, folderPaths } = req.body;
      const data = await googleService.ensureDriveFolderTree(connectionId, baseFolderId, folderPaths);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }

  public getDriveAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { connectionId } = req.body;
      const data = await googleService.getDriveAccessToken(connectionId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }
}

export const googleController = new GoogleController();
