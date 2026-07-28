import { eq, gt, desc, and } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { projects } from '../db/schema/projects';

type NewProject = typeof projects.$inferInsert;

export class ProjectService {
    async createProject(data: NewProject) {
        const [newProject] = await db.insert(projects).values(data).returning();
        return newProject;
    }

    async getProjects(userId?: string, updatedAfter?: string) {
        const conditions = [];

        if (userId) {
            conditions.push(eq(projects.userId, userId));
        }

        if (updatedAfter) {
            conditions.push(gt(projects.updatedAt, updatedAfter));
        }

        const query = db.select().from(projects).orderBy(desc(projects.updatedAt));

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        return await query;
    }
}
