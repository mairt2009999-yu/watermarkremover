CREATE TABLE "credit_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"type" text NOT NULL,
	"reason" text NOT NULL,
	"feature_used" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_credit_config" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"monthly_credits" integer NOT NULL,
	"rollover_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_credit_config_plan_id_unique" UNIQUE("plan_id")
);
--> statement-breakpoint
CREATE TABLE "user_credits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"monthly_allocation" integer DEFAULT 0 NOT NULL,
	"last_reset_date" timestamp,
	"total_earned" integer DEFAULT 0 NOT NULL,
	"total_spent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_credits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;