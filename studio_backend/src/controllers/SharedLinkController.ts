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
            const sourceProjectId = req.query.sourceProjectId as string | undefined;
            const requestedCreatedBy = req.query.createdBy as string | undefined;
            const updatedAfter = req.query.updatedAfter as string | undefined;

            const createdBy = getEffectiveUserId(req, requestedCreatedBy);

            const sharedLinks = await sharedLinkService.getSharedLinks(sourceProjectId, createdBy, updatedAfter);
            res.status(200).json({ success: true, data: sharedLinks });
        } catch (error: any) {
            console.error("Error fetching shared links:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const sharedLinkController = new SharedLinkController();
