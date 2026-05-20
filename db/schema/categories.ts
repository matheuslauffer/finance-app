import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

import { users } from './users';

export const categories = pgTable(
  'categories',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    userId: text('user_id')
      .references(() => users.id)
      .notNull(),

    parentCategoryId: uuid(
      'parent_category_id'
    ),

    name: text('name')
      .notNull(),

    isFixedExpense: boolean(
      'is_fixed_expense'
    )
      .default(false)
      .notNull(),

    includeInForecast: boolean(
      'include_in_forecast'
    )
      .default(true)
      .notNull(),

    isActive: boolean(
      'is_active'
    )
      .default(true)
      .notNull(),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  }
);
