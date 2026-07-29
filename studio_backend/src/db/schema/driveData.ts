import { pgTable, timestamp, uuid, foreignKey, jsonb } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const driveData = pgTable("drive_data", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    projectId: uuid("project_id").notNull(),

    selectedFolders: jsonb("selected_folders"),
    driveData: jsonb("drive_data"),
    syncedFolders: jsonb("synced_folders"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.projectId],
        foreignColumns: [projects.id],
        name: "drive_data_project_id_projects_id_fk"
    }).onDelete("cascade")
]);
