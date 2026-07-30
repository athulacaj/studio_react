CREATE TABLE "albums" (
	"image_id" varchar(100) NOT NULL,
	"link_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"image" jsonb NOT NULL,
	"selections" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "albums_image_id_link_id_pk" PRIMARY KEY("image_id","link_id")
);
--> statement-breakpoint
ALTER TABLE "albums" ADD CONSTRAINT "albums_link_id_shared_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."shared_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "albums" ADD CONSTRAINT "albums_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;