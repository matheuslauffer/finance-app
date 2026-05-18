ALTER TABLE "payment_methods" ALTER COLUMN "method_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."payment_method_type";--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('PIX', 'DEBIT', 'CREDIT_CARD', 'BOLETO', 'BANK_TRANSFER', 'CREDIT_LINE');--> statement-breakpoint
ALTER TABLE "payment_methods" ALTER COLUMN "method_type" SET DATA TYPE "public"."payment_method_type" USING "method_type"::"public"."payment_method_type";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "type";