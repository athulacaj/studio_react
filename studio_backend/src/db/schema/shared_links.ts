import { pgTable, varchar, timestamp, uuid, jsonb, foreignKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";

export const sharedLinks = pgTable("shared_links", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    sourceProjectId: uuid("source_project_id").notNull(),
    categories: jsonb("categories").$type<{ id: string; isHidden: boolean; label: string }[]>(),
    includedFolders: jsonb("included_folders").$type<string[]>(),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.sourceProjectId],
        foreignColumns: [projects.id],
        name: "shared_links_source_project_id_projects_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.createdBy],
        foreignColumns: [users.userId],
        name: "shared_links_created_by_users_user_id_fk"
    }).onDelete("cascade")
]);
