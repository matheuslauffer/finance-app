ALTER TABLE "recurring_transactions" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "payment_method_id" uuid;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "transaction_type" text;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;