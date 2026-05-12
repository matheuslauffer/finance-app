import {
  pgTable,
  uuid,
  integer,
  numeric,
  date,
} from 'drizzle-orm/pg-core';

import { installmentPlans } from './installment-plans';

import { transactions } from './transactions';

import { installmentStatusEnum } from './enums';

export const installments = pgTable(
  'installments',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    installmentPlanId: uuid(
      'installment_plan_id'
    )
      .references(
        () => installmentPlans.id
      )
      .notNull(),

    transactionId: uuid(
      'transaction_id'
    ).references(() => transactions.id),

    installmentNumber: integer(
      'installment_number'
    ).notNull(),

    dueDate: date('due_date')
      .notNull(),

    amount: numeric('amount', {
      precision: 14,
      scale: 2,
    }).notNull(),

    status: installmentStatusEnum(
      'status'
    ).notNull(),
  }
);