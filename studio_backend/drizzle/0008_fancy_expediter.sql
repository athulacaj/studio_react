CREATE TABLE "drive_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"google_email" text,
	"google_display_name" text,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"token_expiry" timestamp with time zone NOT NULL,
	"root_folder_id" text,
	"root_folder_name" text,
	"linked_at" timestamp with time zone DEFAULT now(),
	"status" text DEFAULT 'active' NOT NULL,
	"revoked_at" timestamp with time zone,
	"last_synced_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "drive_connection_id" uuid;--> statement-breakpoint
ALTER TABLE "drive_connections" ADD CONSTRAINT "drive_connections_user_id_users_user_id_fk" FOREIGN KEY ("studio_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drive_connections" ADD CONSTRAINT "drive_connections_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;