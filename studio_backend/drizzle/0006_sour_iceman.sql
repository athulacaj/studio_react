ALTER TABLE "projects" ALTER COLUMN "project_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."project_status";--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED');--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "project_status" SET DATA TYPE "public"."project_status" USING "project_status"::"public"."project_status";