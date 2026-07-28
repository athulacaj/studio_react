import { pgTable, text, timestamp, uuid, unique, foreignKey } from "drizzle-orm/pg-core";
import { userRole } from "./enums";

export const users = pgTable("users", {
    userId: uuid("user_id").defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
    name: text(),
    role: userRole(),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    unique("users_email_unique").on(table.email),
]);

export const authAccounts = pgTable("auth_accounts", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id"),
    provider: text().notNull(),
    providerAccountId: text("provider_account_id"),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    foreignKey({
        columns: [table.userId],
        foreignColumns: [users.userId],
        name: "auth_accounts_user_id_users_user_id_fk"
    }).onDelete("cascade"),
    unique("auth_accounts_provider_provider_account_id_unique").on(table.provider, table.providerAccountId),
]);

export const sessions = pgTable("sessions", {
    sessionId: uuid("session_id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    issuedAt: timestamp("issued_at", { mode: 'string' }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
    ipAddress: text("ip_address"),
}, (table) => [
    foreignKey({
        columns: [table.userId],
        foreignColumns: [users.userId],
        name: "sessions_user_id_users_user_id_fk"
    }),
]);

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
