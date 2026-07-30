import { eq, or } from "drizzle-orm";
import { db } from "../db/drizzle";
import { studios } from "../db/schema";

export type Studio = typeof studios.$inferSelect;
export type NewStudio = typeof studios.$inferInsert;

class TenantRepository {
    async findBySlugOrDomain(identifier: string): Promise<Studio | undefined> {
        const result = await db
            .select()
            .from(studios)
            .where(
                or(
                    eq(studios.slug, identifier),
                    eq(studios.customDomain, identifier)
                )
            )
            .limit(1);

        return result[0];
    }

    async findById(id: number): Promise<Studio | undefined> {
        const result = await db
            .select()
            .from(studios)
            .where(eq(studios.id, id))
            .limit(1);
        return result[0];
    }

    async create(data: NewStudio): Promise<Studio> {
        const result = await db.insert(studios).values(data).returning();
        return result[0];
    }

    async update(id: number, data: Partial<NewStudio>): Promise<Studio | undefined> {
        const result = await db
            .update(studios)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(eq(studios.id, id))
            .returning();
        return result[0];
    }

    async delete(id: number): Promise<void> {
        await db.delete(studios).where(eq(studios.id, id));
    }
    
    async findAll(): Promise<Studio[]> {
        return db.select().from(studios);
    }
}

export default new TenantRepository();