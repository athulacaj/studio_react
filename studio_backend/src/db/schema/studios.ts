import { pgTable, serial, varchar, timestamp, boolean, uniqueIndex, text } from "drizzle-orm/pg-core";

export const studios = pgTable(
    "studios",
    {
        id: serial("id").primaryKey(),
        ownerUserId: text("owner_user_id").notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        slug: varchar("slug", { length: 100 }).notNull(),
        customDomain: varchar("custom_domain", { length: 255 }),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("studios_slug_idx").on(table.slug),
        uniqueIndex("studios_custom_domain_idx").on(table.customDomain),
    ]
);
