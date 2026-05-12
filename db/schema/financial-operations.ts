import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';

import { users } from './users';

import { operationTypeEnum } from './enums';

export const financialOperations = pgTable(
  'financial_operations',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    userId: text('user_id')
      .references(() => users.id)
      .notNull(),

    operationType: operationTypeEnum(
      'operation_type'
    ).notNull(),

    description: text('description')
      .notNull(),

    totalAmount: numeric(
      'total_amount',
      {
        precision: 14,
        scale: 2,
      }
    ).notNull(),

    interestAmount: numeric(
      'interest_amount',
      {
        precision: 14,
        scale: 2,
      }
    )
      .default('0')
      .notNull(),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  }
);