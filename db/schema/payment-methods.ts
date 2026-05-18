import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

import { users } from './users';

import { paymentMethodTypeEnum } from './enums';

export const paymentMethods = pgTable(
  'payment_methods',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    userId: text('user_id')
      .references(() => users.id)
      .notNull(),

    name: text('name')
      .notNull(),

    methodType: paymentMethodTypeEnum(
      'method_type'
    ).notNull(),

    closingDay: integer('closing_day'),

    dueDay: integer('due_day'),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),

  }
);