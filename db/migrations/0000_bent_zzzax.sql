CREATE TYPE "public"."account_type" AS ENUM('CHECKING', 'SAVINGS', 'DIGITAL_WALLET', 'CASH', 'INVESTMENT');--> statement-breakpoint
CREATE TYPE "public"."installment_status" AS ENUM('PENDING', 'PAID', 'CANCELLED', 'ANTICIPATED');--> statement-breakpoint
CREATE TYPE "public"."operation_type" AS ENUM('PURCHASE', 'PIX_CREDIT', 'BOLETO_CREDIT', 'INSTALLMENT_PURCHASE', 'FINANCING', 'TRANSFER');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('PIX', 'DEBIT', 'CREDIT_CARD', 'BOLETO', 'BANK_TRANSFER', 'CREDIT_LINE');--> statement-breakpoint
CREATE TYPE "public"."recurrence_frequency" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('PROJECTED', 'CONFIRMED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"institution" text NOT NULL,
	"account_type" "account_type" NOT NULL,
	"current_balance" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"parent_category_id" uuid,
	"name" text NOT NULL,
	"is_fixed_expense" boolean DEFAULT false NOT NULL,
	"include_in_forecast" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_months" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"reference_month" date NOT NULL,
	"projected_income" numeric DEFAULT '0' NOT NULL,
	"projected_expense" numeric DEFAULT '0' NOT NULL,
	"projected_balance" numeric DEFAULT '0' NOT NULL,
	"committed_amount" numeric DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_operations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"operation_type" "operation_type" NOT NULL,
	"description" text NOT NULL,
	"total_amount" numeric(14, 2) NOT NULL,
	"interest_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forecast_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"financial_month_id" uuid NOT NULL,
	"projected_income" numeric(14, 2) NOT NULL,
	"projected_expense" numeric(14, 2) NOT NULL,
	"projected_balance" numeric(14, 2) NOT NULL,
	"committed_amount" numeric(14, 2) NOT NULL,
	"burn_rate" numeric(14, 2) NOT NULL,
	"category_forecasts" jsonb NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"financial_operation_id" uuid NOT NULL,
	"total_amount" numeric(14, 2) NOT NULL,
	"installment_amount" numeric(14, 2) NOT NULL,
	"installment_count" integer NOT NULL,
	"start_month" date NOT NULL,
	"end_month" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"installment_plan_id" uuid NOT NULL,
	"transaction_id" uuid,
	"installment_number" integer NOT NULL,
	"due_date" date NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"status" "installment_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"method_type" "payment_method_type" NOT NULL,
	"closing_day" integer,
	"due_day" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"supports_installments" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"category_id" uuid NOT NULL,
	"payment_method_id" uuid NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"frequency" "recurrence_frequency" NOT NULL,
	"next_occurrence" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric NOT NULL,
	"transaction_type" text NOT NULL,
	"frequency" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"effective_from" date NOT NULL,
	"effective_until" date,
	"category_id" text NOT NULL,
	"payment_method_id" text NOT NULL,
	"parent_recurring_transaction_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"financial_operation_id" uuid,
	"account_id" uuid,
	"payment_method_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"financial_month_id" uuid NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"transaction_type" "transaction_type" NOT NULL,
	"status" "transaction_status" NOT NULL,
	"occurred_at" timestamp NOT NULL,
	"effective_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"recurring_transaction_id" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_months" ADD CONSTRAINT "financial_months_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_operations" ADD CONSTRAINT "financial_operations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forecast_snapshots" ADD CONSTRAINT "forecast_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forecast_snapshots" ADD CONSTRAINT "forecast_snapshots_financial_month_id_financial_months_id_fk" FOREIGN KEY ("financial_month_id") REFERENCES "public"."financial_months"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_plans" ADD CONSTRAINT "installment_plans_financial_operation_id_financial_operations_id_fk" FOREIGN KEY ("financial_operation_id") REFERENCES "public"."financial_operations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_installment_plan_id_installment_plans_id_fk" FOREIGN KEY ("installment_plan_id") REFERENCES "public"."installment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_financial_operation_id_financial_operations_id_fk" FOREIGN KEY ("financial_operation_id") REFERENCES "public"."financial_operations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_financial_month_id_financial_months_id_fk" FOREIGN KEY ("financial_month_id") REFERENCES "public"."financial_months"("id") ON DELETE no action ON UPDATE no action;