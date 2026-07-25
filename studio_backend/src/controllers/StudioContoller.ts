import { Request, Response, NextFunction } from 'express';
import { cloudflareService } from '../containers';

export class StudioController {
    async getUploadUrl(req: Request, res: Response) {
        const { folder, fileName, contentType } = req.body;

        const result = await cloudflareService.createUploadUrl(
            folder,
            fileName,
            contentType
        );

        res.json(result);
    }

}