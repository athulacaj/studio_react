import {
    pgTable,
    serial,
    varchar,
    timestamp,
    boolean,
    uniqueIndex,
    text,
    uuid,
    unique,
    foreignKey,
    pgEnum,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ['Admin', 'User'])


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

