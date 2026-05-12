import {
  pgTable,
  uuid,
  integer,
  numeric,
  date,
  timestamp,
} from 'drizzle-orm/pg-core';

import { financialOperations } from './financial-operations';

export const installmentPlans = pgTable(
  'installment_plans',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    financialOperationId: uuid(
      'financial_operation_id'
    )
      .references(
        () => financialOperations.id
      )
      .notNull(),

    totalAmount: numeric(
      'total_amount',
      {
        precision: 14,
        scale: 2,
      }
    ).notNull(),

    installmentAmount: numeric(
      'installment_amount',
      {
        precision: 14,
        scale: 2,
      }
    ).notNull(),

    installmentCount: integer(
      'installment_count'
    ).notNull(),

    startMonth: date(
      'start_month'
    ).notNull(),

    endMonth: date(
      'end_month'
    ).notNull(),

    createdAt: timestamp(
      'created_at'
    )
      .defaultNow()
      .notNull(),
  }
);