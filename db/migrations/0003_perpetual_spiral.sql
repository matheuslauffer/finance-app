ALTER TABLE "recurring_transactions" ADD COLUMN "status" text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "effective_from" date NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "effective_until" date;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "parent_recurring_transaction_id" text;--> statement-breakpoint
ALTER TABLE "recurring_transactions" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "recurring_transactions" DROP COLUMN "end_date";