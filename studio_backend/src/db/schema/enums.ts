import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ['Admin', 'User']);
export const projectAssets = pgEnum("project_assets", ['gdrive', 'storage']);
export const source = pgEnum("source", ['google_photos', 'google_drive']);
export const projectStatus = pgEnum("project_status", ['ACTIVE', 'INACTIVE', 'ARCHIVED']);
