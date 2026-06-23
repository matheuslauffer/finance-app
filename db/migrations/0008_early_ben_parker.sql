ALTER TABLE "recurrences" ADD COLUMN "due_day" integer;--> statement-breakpoint
UPDATE "recurrences"
SET "due_day" =
  LEAST(
    31,
    GREATEST(
      1,
      EXTRACT(DAY FROM "next_occurrence")::integer
    )
  )
WHERE "due_day" IS NULL;--> statement-breakpoint
