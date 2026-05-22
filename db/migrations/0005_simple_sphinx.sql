ALTER TYPE "public"."payment_method_type" ADD VALUE 'AUTO_DEBIT';--> statement-breakpoint
ALTER TABLE "financial_months" ADD COLUMN "status" text DEFAULT 'FORECAST' NOT NULL;