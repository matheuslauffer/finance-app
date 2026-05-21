import {
  pgTable,
  uuid,
  numeric,
  timestamp,
  date,
  text,
  unique,
} from 'drizzle-orm/pg-core';

import {
  recurrences,
} from './recurrences';

import {
  financialMonths,
} from './financial-months';

export const
recurringTransactions =
  pgTable(
    'recurring_transactions',
    {

      id:
        uuid('id')
          .defaultRandom()
          .primaryKey(),

      /*
      RECURRENCE
      */

      recurrenceId:
        uuid('recurrence_id')

          .references(
            () => recurrences.id
          )

          .notNull(),

      /*
      FINANCIAL MONTH
      */

      financialMonthId:
        uuid('financial_month_id')

          .references(
            () => financialMonths.id
          )

          .notNull(),

      /*
      SNAPSHOT VALUE
      */

      projectedAmount:
        numeric(
          'projected_amount',
          {
            precision: 14,
            scale: 2,
          }
        ).notNull(),

      /*
      STATUS
      */

      status:
        text('status')

          .$type<
            | 'PROJECTED'
            | 'FULFILLED'
            | 'CANCELLED'
          >()

          .notNull()

          .default(
            'PROJECTED'
          ),

      /*
      DUE DATE
      */

      dueDate:
        date('due_date')
          .notNull(),

      /*
      AUDIT
      */

      generatedAt:
        timestamp(
          'generated_at'
        )

          .defaultNow()

          .notNull(),
    },

    (table) => [

      unique()
        .on(

          table.recurrenceId,

          table.financialMonthId
        ),
    ]
  );