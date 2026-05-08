CREATE TYPE "public"."account_type" AS ENUM('CHECKING', 'SAVINGS', 'DIGITAL_WALLET', 'CASH', 'INVESTMENT');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('PIX', 'DEBIT', 'CREDIT', 'BOLETO', 'BANK_TRANSFER', 'CREDIT_LINE');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('PROJECTED', 'CONFIRMED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_category_id" uuid,
	"name" text NOT NULL,
	"is_fixed_expense" boolean DEFAULT false NOT NULL,
	"include_in_forecast" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;