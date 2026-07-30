import { Request, Response } from 'express';
import { SharedLinkService } from '../services/SharedLinkService';
import { getEffectiveUserId } from '../utils/authUtils';

const sharedLinkService = new SharedLinkService();

export class SharedLinkController {
    async create(req: Request, res: Response) {
        try {
            const data = req.body;
            // Overwrite createdBy with current user's ID
            const createdBy = req.user?.userId;
            if (!createdBy) {
                return res.status(401).json({ success: false, error: "User not authenticated" });
            }
            data.createdBy = createdBy;

            const newSharedLink = await sharedLinkService.createSharedLink(data);
            res.status(201).json({ success: true, data: newSharedLink });
        } catch (error: any) {
            console.error("Error creating shared link:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async get(req: Request, res: Response) {
        try {
            const id = req.query.id as string | undefined;
            const sourceProjectId = req.query.sourceProjectId as string | undefined;
            const requestedCreatedBy = req.query.createdBy as string | undefined;
            const updatedAfter = req.query.updatedAfter as string | undefined;

            const createdBy = getEffectiveUserId(req, requestedCreatedBy);

            const sharedLinks = await sharedLinkService.getSharedLinks(id, sourceProjectId, createdBy, updatedAfter);
            res.status(200).json({ success: true, data: sharedLinks });
        } catch (error: any) {
            console.error("Error fetching shared links:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const data = req.body;

            const updatedSharedLink = await sharedLinkService.updateSharedLink(id, data);
            res.status(200).json({ success: true, data: updatedSharedLink });
        } catch (error: any) {
            console.error("Error updating shared link:", error);
            if (error.message.includes("not found")) {
                return res.status(404).json({ success: false, error: error.message });
            }
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const sharedLinkController = new SharedLinkController();
