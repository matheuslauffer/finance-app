import {
  pgTable,
  uuid,
  text,
  numeric,
  varchar
} from 'drizzle-orm/pg-core';

import { users }
  from './users';

export const financialMonths =
  pgTable(
    'financial_months',
    {
      id: uuid('id')
        .defaultRandom()
        .primaryKey(),

      userId: text('user_id')
        .references(() => users.id)
        .notNull(),

      referenceMonth:
        varchar('reference_month', { length: 7 })
          .notNull(),

      projectedIncome:
        numeric(
          'projected_income'
        )
          .notNull()
          .default('0'),

        projectedExpense:
          numeric(
            'projected_expense'
          )
            .notNull()
            .default('0'),

          projectedBalance:
            numeric(
              'projected_balance'
            )
              .notNull()
              .default('0'),

          committedAmount:
            numeric(
              'committed_amount'
            )
              .notNull()
              .default('0'),

          status: text('status', {

            enum: [
              'FORECAST',
              'OPEN',
              'CLOSED',
            ],
          })

          .notNull()

          .default('FORECAST'),
      }
  );