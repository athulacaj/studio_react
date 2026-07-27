CREATE TYPE "public"."user_role" AS ENUM('Admin', 'User');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role";