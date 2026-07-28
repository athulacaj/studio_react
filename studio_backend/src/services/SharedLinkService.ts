import { eq, gt, desc, and } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { sharedLinks } from '../db/schema/shared_links';

type NewSharedLink = typeof sharedLinks.$inferInsert;

export class SharedLinkService {
    async createSharedLink(data: NewSharedLink) {
        const [newSharedLink] = await db.insert(sharedLinks).values(data).returning();
        return newSharedLink;
    }

    async getSharedLinks(sourceProjectId?: string, createdBy?: string, updatedAfter?: string) {
        const conditions = [];

        if (sourceProjectId) {
            conditions.push(eq(sharedLinks.sourceProjectId, sourceProjectId));
        }

        if (createdBy) {
            conditions.push(eq(sharedLinks.createdBy, createdBy));
        }

        if (updatedAfter) {
            conditions.push(gt(sharedLinks.updatedAt, updatedAfter));
        }

        const query = db.select().from(sharedLinks).orderBy(desc(sharedLinks.updatedAt));

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        return await query;
    }
}
