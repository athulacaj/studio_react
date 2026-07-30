import { pgTable, varchar, timestamp, uuid, jsonb, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { sharedLinks } from "./shared_links";
import { projects } from "./projects";

export const albums = pgTable("albums", {
    imageId: varchar("image_id", { length: 100 }).notNull(),
    linkId: uuid("link_id").notNull(),
    projectId: uuid("project_id").notNull(),
    image: jsonb("image").notNull(),
    selections: jsonb("selections").$type<string[]>().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
}, (table) => [
    primaryKey({ columns: [table.imageId, table.linkId] }),
    foreignKey({
        columns: [table.linkId],
        foreignColumns: [sharedLinks.id],
        name: "albums_link_id_shared_links_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.projectId],
        foreignColumns: [projects.id],
        name: "albums_project_id_projects_id_fk"
    }).onDelete("cascade")
]);
