import { pgTable, varchar, timestamp, uuid, jsonb, text, foreignKey, index } from "drizzle-orm/pg-core";
import { sharedLinks } from "./shared_links";
import { source } from "./enums";

export const selectedAlbums = pgTable("selected_albums", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    sharedLinkId: uuid("shared_link_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }),
    source: source("source"),
    src: text("src"),
    url: text("url"),
    selections: jsonb("selections"),
    folderPathList: jsonb("folder_path_list").$type<string[]>(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.sharedLinkId],
        foreignColumns: [sharedLinks.id],
        name: "selected_albums_shared_link_id_shared_links_id_fk"
    }).onDelete("cascade"),
    index("selected_albums_updated_at_idx").on(table.updatedAt)
]);
