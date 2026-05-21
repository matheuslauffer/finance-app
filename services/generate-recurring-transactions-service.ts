import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  and,
  eq,
} from 'drizzle-orm';

import {
  getReferenceMonth,
} from '@/lib/reference-month';

function
addFrequency(
  date: Date,

  frequency:
    | 'DAILY'
    | 'WEEKLY'
    | 'BIWEEKLY'
    | 'MONTHLY'
    | 'YEARLY'
) {

  const next =
    new Date(date);

  switch (frequency) {

    case 'DAILY':

      next.setDate(
        next.getDate() + 1
      );

      break;

    case 'WEEKLY':

      next.setDate(
        next.getDate() + 7
      );

      break;

    case 'BIWEEKLY':

      next.setDate(
        next.getDate() + 14
      );

      break;

    case 'MONTHLY':

      next.setMonth(
        next.getMonth() + 1
      );

      break;

    case 'YEARLY':

      next.setFullYear(
        next.getFullYear() + 1
      );

      break;
  }

  return next;
}

export async function
generateRecurringTransactions(
  recurrenceId: string
) {

  /*
  RECURRENCE
  */

  const [recurrence] =
    await db

      .select()

      .from(recurrences)

      .where(
        eq(
          recurrences.id,
          recurrenceId
        )
      );

  if (!recurrence) {

    throw new Error(
      'Recurrence not found'
    );
  }

  if (
    !recurrence.isActive
    ||
    recurrence.endedAt
  ) {

    return;
  }

  /*
  GENERATE 12 MONTHS
  */

  let currentDate =
    new Date(
      recurrence.nextOccurrence
    );

  for (
    let index = 0;
    index < 12;
    index++
  ) {

    /*
    REFERENCE MONTH
    */

    const referenceMonth =
      getReferenceMonth(
        currentDate
      );

    /*
    FINANCIAL MONTH
    */

    let [financialMonth] =
      await db

        .select()

        .from(financialMonths)

        .where(
          and(

            eq(
              financialMonths.userId,
              recurrence.userId
            ),

            eq(
              financialMonths.referenceMonth,
              referenceMonth
            )
          )
        );

    if (!financialMonth) {

      const [createdMonth] =
        await db

          .insert(
            financialMonths
          )

          .values({

            userId:
              recurrence.userId,

            referenceMonth,

            projectedIncome:
              '0',

            projectedExpense:
              '0',

            projectedBalance:
              '0',

            committedAmount:
              '0',
          })

          .returning();

      financialMonth =
        createdMonth;
    }

    /*
    EXISTING SNAPSHOT
    */

    const [existing] =
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

              recurrence.id
            ),

            eq(
              recurringTransactions
                .financialMonthId,

              financialMonth.id
            )
          )
        );

    /*
    SKIP DUPLICATE
    */

    if (!existing) {

      await db

        .insert(
          recurringTransactions
        )

        .values({

          recurrenceId:
            recurrence.id,

          financialMonthId:
            financialMonth.id,

          projectedAmount:
            recurrence.amount,

          dueDate:
            currentDate
              .toISOString()
              .split('T')[0],

          status:
            'PROJECTED',
        });
    }

    /*
    NEXT OCCURRENCE
    */

    currentDate =
      addFrequency(
        currentDate,
        recurrence.frequency
      );
  }
  await db

  .update(recurrences)

  .set({

    nextOccurrence:
      currentDate
        .toISOString()
        .split('T')[0],
  })

  .where(
    eq(
      recurrences.id,
      recurrence.id
    )
  );
}