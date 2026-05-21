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

export async function
getProjectedTransactions(

  userId: string,

  month: string
) {

  /*
  FINANCIAL MONTH
  */

  const [financialMonth] =
    await db

      .select()

      .from(financialMonths)

      .where(
        and(

          eq(
            financialMonths.userId,
            userId
          ),

          eq(
            financialMonths.referenceMonth,
            month
          )
        )
      );

  if (!financialMonth) {

    return [];
  }

  /*
  SNAPSHOTS
  */

  const projections =
    await db

      .select({

        id:
          recurringTransactions.id,

        projectedAmount:
          recurringTransactions
            .projectedAmount,

        dueDate:
          recurringTransactions
            .dueDate,

        status:
          recurringTransactions
            .status,

        description:
          recurrences.description,

        frequency:
          recurrences.frequency,
      })

      .from(
        recurringTransactions
      )

      .innerJoin(

        recurrences,

        eq(
          recurringTransactions
            .recurrenceId,

          recurrences.id
        )
      )

      .where(
        and(

          eq(
            recurringTransactions
              .financialMonthId,

            financialMonth.id
          ),

          eq(
            recurringTransactions
              .status,

            'PROJECTED'
          )
        )
      );

  return projections.map(
    (item) => ({

      recurringTransactionId:
        item.id,

      description:
        item.description,

      amount:
        Number(
          item.projectedAmount
        ),

      projectedTotal:
        Number(
          item.projectedAmount
        ),

      projectedOccurrences:
        1,

      frequency:
        item.frequency,

      dueDate:
        item.dueDate,
    })
  );
}