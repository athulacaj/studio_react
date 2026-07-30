import { pgTable, varchar, timestamp, text, uuid, foreignKey, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projectAssets, source, projectStatus } from "./enums";

export const projects = pgTable("projects", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    userId: uuid("user_id").notNull(),

    // Google Drive Sync Fields
    source: source("source"),
    status: projectStatus("project_status"),
    projectAssets: projectAssets("project_assets"),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    driveUrl: text("drive_url"),
    driveConnectionId: uuid("drive_connection_id"),
}, (table) => [
    foreignKey({
        columns: [table.userId],
        foreignColumns: [users.userId],
        name: "projects_user_id_users_user_id_fk"
    }).onDelete("cascade"),
    index("projects_updated_at_idx").on(table.updatedAt)
]);
