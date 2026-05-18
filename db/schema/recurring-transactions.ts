import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  date,
} from 'drizzle-orm/pg-core';

export const
recurringTransactions =
  pgTable(
    'recurring_transactions',
    {

      id: uuid('id')
        .defaultRandom()
        .primaryKey(),

      userId:
        text('user_id')
          .notNull(),

      /*
      DESCRIPTION
      */

      description:
        text(
          'description'
        ).notNull(),

      /*
      VALUE
      */

      amount:
        numeric(
          'amount'
        )
          .notNull(),

      /*
      TYPE
      */

      transactionType:
        text(
          'transaction_type'
        )
          .$type<
            | 'INCOME'
            | 'EXPENSE'
          >()
          .notNull(),

      /*
      FREQUENCY
      */

      frequency:
        text(
          'frequency'
        )
          .$type<
            | 'DAILY'
            | 'WEEKLY'
            | 'BIWEEKLY'
            | 'MONTHLY'
            | 'YEARLY'
          >()
          .notNull(),

      /*
      STATUS
      */

      status:
        text(
          'status'
        )
          .$type<
            | 'ACTIVE'
            | 'PAUSED'
            | 'ENDED'
          >()
          .notNull()
          .default('ACTIVE'),

      /*
      EFFECTIVE DATES
      */

      effectiveFrom:
        date(
          'effective_from'
        ).notNull(),

      effectiveUntil:
        date(
          'effective_until'
        ),

      /*
      RELATIONS
      */

      categoryId:
        text(
          'category_id'
        ).notNull(),

      paymentMethodId:
        text(
          'payment_method_id'
        ).notNull(),

      /*
      VERSIONING
      */

      parentRecurringTransactionId:
        text(
          'parent_recurring_transaction_id'
        ),

      /*
      TIMESTAMPS
      */

      createdAt:
        timestamp(
          'created_at'
        )
          .defaultNow()
          .notNull(),
    }
  );