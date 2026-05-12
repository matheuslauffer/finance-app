import {
  pgTable,
  uuid,
  date,
  text
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
        date('reference_month')
          .notNull(),
    }
  );