CREATE SCHEMA "marketing";
--> statement-breakpoint
CREATE TABLE "marketing"."diagnostic_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"initiative_text" text,
	"duration" text,
	"commitment" text,
	"still_delivering" text,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"pillar_scores" jsonb,
	"pillar_bands" jsonb,
	"archetype" text,
	"mirrors_fired" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommendations_shown" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"role" text,
	"company_size" text,
	"sector" text,
	"email" text,
	"email_is_free_provider" boolean DEFAULT false NOT NULL,
	"referrer" text,
	"utm" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"duration_seconds" integer,
	"device" text,
	"last_question_id" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX "diagnostic_submissions_session_id_idx" ON "marketing"."diagnostic_submissions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "diagnostic_submissions_completed_at_idx" ON "marketing"."diagnostic_submissions" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "diagnostic_submissions_archetype_idx" ON "marketing"."diagnostic_submissions" USING btree ("archetype");
