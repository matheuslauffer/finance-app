import {
  pgTable,
  uuid,
  text,
  numeric,
  date,
  boolean,
} from 'drizzle-orm/pg-core';

import { users } from './users';

import { categories } from './categories';

import { paymentMethods } from './payment-methods';

import { recurrenceFrequencyEnum } from './enums';

export const recurrences = pgTable(
  'recurrences',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    userId: text('user_id')
      .references(() => users.id)
      .notNull(),

    categoryId: uuid('category_id')
      .references(() => categories.id)
      .notNull(),

    paymentMethodId: uuid(
      'payment_method_id'
    )
      .references(() => paymentMethods.id)
      .notNull(),

    description: text('description')
      .notNull(),

    amount: numeric('amount', {
      precision: 14,
      scale: 2,
    }).notNull(),

    frequency:
      recurrenceFrequencyEnum(
        'frequency'
      ).notNull(),

    nextOccurrence: date(
      'next_occurrence'
    ).notNull(),

    isActive: boolean('is_active')
      .default(true)
      .notNull(),

    endedAt: date('ended_at'),

    transactionType: text(
      'transaction_type'
    )
      .$type<
        'INCOME'
        | 'EXPENSE'
      >()
      .notNull(),
  }
);