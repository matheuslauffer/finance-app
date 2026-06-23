import {
  db,
} from '@/db';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  and,
  eq,
  gte,
  sql,
} from 'drizzle-orm';

import {
  generateRecurringTransactions,
} from './generate-recurring-transactions-service';

import {
  recalculateFinancialMonth,
} from './recalculate-financial-month';

type Input = {

  recurrenceId: string;

  userId: string;

  description: string;

  amount: string;

  transactionType:
    | 'INCOME'
    | 'EXPENSE';

  frequency:
    | 'DAILY'
    | 'WEEKLY'
    | 'BIWEEKLY'
    | 'MONTHLY'
    | 'YEARLY';

  categoryId: string;

  paymentMethodId: string;

  nextOccurrence: string;

  dueDay: number;

  weekDay:
    number | null;

  endedAt:
    string | null;
};

export async function
updateRecurringTransaction({

  recurrenceId,

  userId,

  description,

  amount,

  transactionType,

  frequency,

  categoryId,

  paymentMethodId,

  nextOccurrence,

  dueDay,

  weekDay,

  endedAt,
}: Input) {

  const today =
    new Date()
      .toISOString()
      .split('T')[0];

  /*
  OLD SNAPSHOTS
  */

  const futureSnapshots =
    await db

      .select()

      .from(
        recurringTransactions
      )

      .where(
        and(

          eq(
            recurringTransactions
              .recurrenceId,

            recurrenceId
          ),

          gte(
            recurringTransactions
              .dueDate,

            today
          ),

          sql`
            not exists (
              select
                1
              from
                transactions
              where
                transactions.recurring_transaction_id
                =
                ${recurringTransactions.id}::text
              and
                transactions.status
                =
                'CONFIRMED'
            )
          `
        )
      );

  /*
  AFFECTED MONTHS
  */

  const affectedMonthIds =
    [
      ...new Set(

        futureSnapshots.map(
          (item) =>
            item.financialMonthId
        )
      )
    ];

  /*
  DELETE FUTURE SNAPSHOTS
  */

  await db

    .delete(
      recurringTransactions
    )

    .where(
      and(

        eq(
          recurringTransactions
            .recurrenceId,

          recurrenceId
        ),

        gte(
          recurringTransactions
            .dueDate,

          today
        ),

        sql`
          not exists (
            select
              1
            from
              transactions
            where
              transactions.recurring_transaction_id
              =
              ${recurringTransactions.id}::text
            and
              transactions.status
              =
              'CONFIRMED'
          )
        `
      )
    );

  /*
  UPDATE RECURRENCE
  */

  await db

    .update(recurrences)

    .set({

      description,

      amount,

      transactionType,

      frequency,

      categoryId,

      paymentMethodId,

      nextOccurrence,

      dueDay,

      weekDay,

      endedAt,
    })

    .where(
      and(

        eq(
          recurrences.id,
          recurrenceId
        ),

        eq(
          recurrences.userId,
          userId
        )
      )
    );

  /*
  REGENERATE SNAPSHOTS
  */

  await generateRecurringTransactions(
    recurrenceId,

    {
      fromDate:
        new Date(
          today
        ),
    }
  );

  /*
  RECALCULATE
  */

  for (
    const monthId
    of affectedMonthIds
  ) {

    await recalculateFinancialMonth(
      monthId
    );
  }

  /*
  RECALCULATE NEW MONTHS
  */

  const newMonths =
    await db

      .select()

      .from(financialMonths)

      .where(
        eq(
          financialMonths.userId,
          userId
        )
      );

  for (
    const month
    of newMonths
  ) {

    await recalculateFinancialMonth(
      month.id
    );
  }
}
