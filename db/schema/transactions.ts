import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  date,
} from 'drizzle-orm/pg-core';

import { users } from './users';

import { accounts } from './accounts';

import { categories } from './categories';

import { paymentMethods } from './payment-methods';

import { financialMonths } from './financial-months';

import { financialOperations } from './financial-operations';

import {
  transactionTypeEnum,
  transactionStatusEnum,
} from './enums';

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    userId: text('user_id')
      .references(() => users.id)
      .notNull(),

    financialOperationId: uuid(
      'financial_operation_id'
    ).references(
      () => financialOperations.id
    ),

    accountId: uuid('account_id')
      .references(() => accounts.id),

    paymentMethodId: uuid(
      'payment_method_id'
    )
      .references(() => paymentMethods.id)
      .notNull(),

    categoryId: uuid('category_id')
      .references(() => categories.id)
      .notNull(),

    financialMonthId: uuid(
      'financial_month_id'
    )
      .references(() => financialMonths.id)
      .notNull(),

    description: text('description')
      .notNull(),

    amount: numeric('amount', {
      precision: 14,
      scale: 2,
    }).notNull(),

    transactionType:
      transactionTypeEnum(
        'transaction_type'
      ).notNull(),

    status: transactionStatusEnum(
      'status'
    ).notNull(),

    occurredAt: timestamp(
      'occurred_at'
    ).notNull(),

    effectiveDate: date(
      'effective_date'
    ).notNull(),

    createdAt: timestamp(
      'created_at'
    )
      .defaultNow()
      .notNull(),
  }
);