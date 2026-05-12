import {
  pgTable,
  uuid,
  text,
  numeric,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

import { users } from './users';

import { financialMonths }
  from './financial-months';

export const forecastSnapshots =
  pgTable(
    'forecast_snapshots',
    {
      id: uuid('id')
        .defaultRandom()
        .primaryKey(),

      userId: text('user_id')
        .references(() => users.id)
        .notNull(),

      financialMonthId: uuid(
        'financial_month_id'
      )
        .references(
          () => financialMonths.id
        )
        .notNull(),

      projectedIncome: numeric(
        'projected_income',
        {
          precision: 14,
          scale: 2,
        }
      ).notNull(),

      projectedExpense: numeric(
        'projected_expense',
        {
          precision: 14,
          scale: 2,
        }
      ).notNull(),

      projectedBalance: numeric(
        'projected_balance',
        {
          precision: 14,
          scale: 2,
        }
      ).notNull(),

      committedAmount: numeric(
        'committed_amount',
        {
          precision: 14,
          scale: 2,
        }
      ).notNull(),

      burnRate: numeric(
        'burn_rate',
        {
          precision: 14,
          scale: 2,
        }
      ).notNull(),

      categoryForecasts: jsonb(
        'category_forecasts'
      ).notNull(),

      calculatedAt: timestamp(
        'calculated_at'
      )
        .defaultNow()
        .notNull(),
    }
  );