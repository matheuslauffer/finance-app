ALTER TABLE "financial_months" ADD COLUMN "projected_income" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "financial_months" ADD COLUMN "projected_expense" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "financial_months" ADD COLUMN "projected_balance" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "financial_months" ADD COLUMN "committed_amount" numeric DEFAULT '0' NOT NULL;