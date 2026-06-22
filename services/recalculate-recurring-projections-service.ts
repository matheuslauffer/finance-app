import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  eq,
} from 'drizzle-orm';

import {
  getFinancialCompetencyDate,
} from '@/lib/payment-method-competency';

import{
    findNextAvailableFinancialMonth,
} from '@/lib/find-next-available-financial-month';

type Input = {

  recurrenceId: string;
};

export async function
recalculateRecurringProjections({
  recurrenceId,
}: Input) {

  /*
  SNAPSHOTS
  */

  const snapshots =
    await db

      .select({

        recurring:
          recurringTransactions,

        paymentMethod:
          paymentMethods,
      })

      .from(
        recurringTransactions
      )

      .leftJoin(

        paymentMethods,

        eq(
          recurringTransactions.paymentMethodId,
          paymentMethods.id
        )
      )

      .where(
        eq(
          recurringTransactions.recurrenceId,
          recurrenceId
        )
      );

  /*
  RECALCULATE
  */

  for (const item of snapshots) {

    const competencyDate =
      getFinancialCompetencyDate({

        occurredAt:
          new Date(
            item.recurring.dueDate
          ),

        closingDay:
          item.paymentMethod
            ?.closingDay
          ?? null,

        dueDay:
          item.paymentMethod
            ?.dueDay
          ?? null,
      });

    const referenceMonth =
      `${competencyDate.getFullYear()}-${String(
        competencyDate.getMonth() + 1
      ).padStart(2, '0')}`;

    /*
    FIND MONTH
    */

    const [month] =
      await db

        .select()

        .from(
          financialMonths
        )

        .where(
          eq(
            financialMonths.referenceMonth,
            referenceMonth
          )
        );

    if (!month) {

      continue;
    }

    /*
FIND AVAILABLE SLOT
*/

const availableMonthId =
  await findNextAvailableFinancialMonth({

    recurrenceId:
      item.recurring.recurrenceId,

    startMonthId:
      month.id,
  });

    /*
    UPDATE SNAPSHOT
    */

    await db

    .update(
        recurringTransactions
    )

    .set({

        financialMonthId:
        availableMonthId,
    })

    .where(
        eq(
        recurringTransactions.id,
        item.recurring.id
        )
    );
  }
}