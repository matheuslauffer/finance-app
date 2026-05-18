CREATE TABLE "recurring_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric NOT NULL,
	"transaction_type" text NOT NULL,
	"frequency" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"category_id" text NOT NULL,
	"payment_method_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
