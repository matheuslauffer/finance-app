import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  and,
  eq,
} from 'drizzle-orm';

type Input = {

  recurrenceId: string;

  startMonthId: string;
};

export async function
findNextAvailableFinancialMonth({
  recurrenceId,
  startMonthId,
}: Input) {

  let currentMonthId =
    startMonthId;

  while (true) {

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

              recurrenceId
            ),

            eq(
              recurringTransactions
                .financialMonthId,

              currentMonthId
            )
          )
        );

    /*
    FREE SLOT
    */

    if (!existing) {

      return currentMonthId;
    }

    /*
    NEXT MONTH
    */

    const [month] =
      await db

        .select()

        .from(
          financialMonths
        )

        .where(
          eq(
            financialMonths.id,
            currentMonthId
          )
        );

    if (!month) {

      return currentMonthId;
    }

    const currentDate =
      new Date(
        `${month.referenceMonth}-01`
      );

    currentDate.setMonth(
      currentDate.getMonth() + 1
    );

    const nextReference =
      `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, '0')}`;

    const [nextMonth] =
      await db

        .select()

        .from(
          financialMonths
        )

        .where(
          eq(
            financialMonths.referenceMonth,
            nextReference
          )
        );

    if (!nextMonth) {

      return currentMonthId;
    }

    currentMonthId =
      nextMonth.id;
  }
}