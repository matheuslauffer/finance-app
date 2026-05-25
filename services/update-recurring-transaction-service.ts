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

  endedAt,
}: Input) {

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

          eq(
            recurringTransactions
              .status,

            'PROJECTED'
          ),

          gte(
            recurringTransactions
              .dueDate,

            new Date()
              .toISOString()
              .split('T')[0]
          )
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

        eq(
          recurringTransactions
            .status,

          'PROJECTED'
        ),

        gte(
          recurringTransactions
            .dueDate,

          new Date()
            .toISOString()
            .split('T')[0]
        )
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
    recurrenceId
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

      .from(financialMonths);

  for (
    const month
    of newMonths
  ) {

    await recalculateFinancialMonth(
      month.id
    );
  }
}