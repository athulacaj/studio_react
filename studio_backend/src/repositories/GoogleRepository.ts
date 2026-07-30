import { eq } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { driveConnections } from '../db/schema/driveConnections';
import { projects } from '../db/schema/projects';
import { driveData } from '../db/schema/driveData';

export class GoogleRepository {
    async createDriveConnection(data: typeof driveConnections.$inferInsert) {
        const [result] = await db.insert(driveConnections).values(data).returning();
        return result;
    }

    async getActiveConnection(connectionId: string) {
        const connection = await db.query.driveConnections.findFirst({
            where: (connections, { eq, and }) => and(
                eq(connections.id, connectionId),
                eq(connections.status, 'active')
            )
        });
        return connection;
    }

    async updateDriveConnection(connectionId: string, updates: Partial<typeof driveConnections.$inferInsert>) {
        const [updated] = await db.update(driveConnections)
            .set(updates)
            .where(eq(driveConnections.id, connectionId))
            .returning();
        return updated;
    }

    async updateProjectDriveConnection(projectId: string, connectionId: string | null) {
        await db.update(projects)
            .set({ driveConnectionId: connectionId })
            .where(eq(projects.id, projectId));
    }

    async updateSyncedFoldersSummary(projectId: string, folderId: string, summaryData: any) {
        // First get the existing drive data for this project
        const existingData = await db.query.driveData.findFirst({
            where: eq(driveData.projectId, projectId)
        });

        let syncedFolders = existingData?.syncedFolders as Record<string, any> || {};
        syncedFolders[folderId] = summaryData;

        if (existingData) {
            await db.update(driveData)
                .set({ syncedFolders })
                .where(eq(driveData.projectId, projectId));
        } else {
            await db.insert(driveData).values({
                projectId,
                syncedFolders
            });
        }
    }

    async getSyncedFoldersSummary(projectId: string) {
        const existingData = await db.query.driveData.findFirst({
            where: eq(driveData.projectId, projectId)
        });
        return existingData?.syncedFolders as Record<string, any> || {};
    }
}

export const googleRepository = new GoogleRepository();
