import { eq, gt, desc, and } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { projects } from '../db/schema/projects';
import { driveData as driveDataTable } from '../db/schema/driveData';

type NewProject = typeof projects.$inferInsert;

export class ProjectService {
    async createProject(projectData: NewProject, driveDataInput?: any) {
        let savedProject;

        if (projectData.id) {
            // Update existing project
            const [updated] = await db.update(projects)
                .set({
                    ...projectData,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(projects.id, projectData.id))
                .returning();
            savedProject = updated;
        } else {
            // Create new project
            const [created] = await db.insert(projects).values(projectData).returning();
            savedProject = created;
        }

        if (driveDataInput && savedProject) {
            // Replace drive data
            await db.delete(driveDataTable).where(eq(driveDataTable.projectId, savedProject.id));
            await db.insert(driveDataTable).values({
                projectId: savedProject.id,
                driveData: driveDataInput.driveData,
                selectedFolders: driveDataInput.selectedFolders
            });
        }

        return savedProject;
    }

    async getProjects(userId?: string, updatedAfter?: string) {
        const conditions = [];

        if (userId) {
            conditions.push(eq(projects.userId, userId));
        }

        if (updatedAfter) {
            conditions.push(gt(projects.updatedAt, updatedAfter));
        }

        const query = db
            .select({
                project: projects,
                driveData: driveDataTable
            })
            .from(projects)
            .leftJoin(driveDataTable, eq(projects.id, driveDataTable.projectId))
            .orderBy(desc(projects.updatedAt));

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        const results = await query;
        
        // Remove driveData from payload if it is null
        return results.map(row => {
            if (!row.driveData) {
                return { project: row.project };
            }
            return row;
        });
    }
}
