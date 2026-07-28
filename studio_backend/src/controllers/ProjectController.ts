import { Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';
import { getEffectiveUserId } from '../utils/authUtils';

const projectService = new ProjectService();

export class ProjectController {
    async create(req: Request, res: Response) {
        try {
            const data = req.body;
            // Overwrite userId with current user's ID
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: "User not authenticated" });
            }
            data.userId = userId;

            const newProject = await projectService.createProject(data);
            res.status(201).json({ success: true, data: newProject });
        } catch (error: any) {
            console.error("Error creating project:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async get(req: Request, res: Response) {
        try {
            const requestedUserId = req.query.userId as string | undefined;
            const updatedAfter = req.query.updatedAfter as string | undefined;

            const userId = getEffectiveUserId(req, requestedUserId);

            const projects = await projectService.getProjects(userId, updatedAfter);
            res.status(200).json({ success: true, data: projects });
        } catch (error: any) {
            console.error("Error fetching projects:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const projectController = new ProjectController();
