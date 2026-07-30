import { Request, Response } from 'express';
import { AlbumService } from '../services/AlbumService';

const albumService = new AlbumService();

export class AlbumController {
    async create(req: Request, res: Response) {
        try {
            const data = req.body;
            
            // Expected data is an array for bulk insert
            const newAlbums = await albumService.createAlbums(data);
            res.status(201).json({ success: true, data: newAlbums });
        } catch (error: any) {
            console.error("Error creating albums:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async get(req: Request, res: Response) {
        try {
            const linkId = req.query.link_id as string | undefined;

            const fetchedAlbums = await albumService.getAlbums(linkId);
            res.status(200).json({ success: true, data: fetchedAlbums });
        } catch (error: any) {
            console.error("Error fetching albums:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const albumController = new AlbumController();
