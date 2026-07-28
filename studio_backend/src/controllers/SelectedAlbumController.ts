import { Request, Response } from 'express';
import { SelectedAlbumService } from '../services/SelectedAlbumService';

const selectedAlbumService = new SelectedAlbumService();

export class SelectedAlbumController {
    async create(req: Request, res: Response) {
        try {
            const data = req.body;
            const newSelectedAlbum = await selectedAlbumService.createSelectedAlbum(data);
            res.status(201).json({ success: true, data: newSelectedAlbum });
        } catch (error: any) {
            console.error("Error creating selected album:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async get(req: Request, res: Response) {
        try {
            const sharedLinkId = req.query.sharedLinkId as string | undefined;
            const updatedAfter = req.query.updatedAfter as string | undefined;

            const selectedAlbums = await selectedAlbumService.getSelectedAlbums(sharedLinkId, updatedAfter);
            res.status(200).json({ success: true, data: selectedAlbums });
        } catch (error: any) {
            console.error("Error fetching selected albums:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const selectedAlbumController = new SelectedAlbumController();
