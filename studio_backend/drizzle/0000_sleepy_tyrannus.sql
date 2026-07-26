CREATE TABLE "studios" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"custom_domain" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "studios_slug_idx" ON "studios" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "studios_custom_domain_idx" ON "studios" USING btree ("custom_domain");