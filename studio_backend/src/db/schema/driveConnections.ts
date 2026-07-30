import { pgTable, text, timestamp, uuid, foreignKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";

export const driveConnections = pgTable("drive_connections", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    studioUserId: uuid("studio_user_id").notNull(),
    projectId: uuid("project_id").notNull(),
    googleEmail: text("google_email"),
    googleDisplayName: text("google_display_name"),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
    tokenExpiry: timestamp("token_expiry", { withTimezone: true, mode: "date" }).notNull(),
    rootFolderId: text("root_folder_id"),
    rootFolderName: text("root_folder_name"),
    linkedAt: timestamp("linked_at", { withTimezone: true, mode: "date" }).defaultNow(),
    status: text("status").notNull().default("active"),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true, mode: "date" }),
}, (table) => [
    foreignKey({
        columns: [table.studioUserId],
        foreignColumns: [users.userId],
        name: "drive_connections_user_id_users_user_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.projectId],
        foreignColumns: [projects.id],
        name: "drive_connections_project_id_projects_id_fk"
    }).onDelete("cascade"),
]);
