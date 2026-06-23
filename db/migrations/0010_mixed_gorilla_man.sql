ALTER TABLE "recurring_transactions" DROP CONSTRAINT "recurring_transactions_recurrence_id_financial_month_id_unique";--> statement-breakpoint
ALTER TABLE "recurrences" ADD COLUMN "week_day" integer;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_recurrence_id_due_date_unique" UNIQUE("recurrence_id","due_date");