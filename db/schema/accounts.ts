import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';

import { users } from './users';

import { accountTypeEnum } from './enums';

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),

    name: text('name')
      .notNull(),

    institution: text('institution')
      .notNull(),

    accountType: accountTypeEnum(
      'account_type'
    ).notNull(),

    currentBalance: numeric(
      'current_balance',
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