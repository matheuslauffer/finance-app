import { db } from '@/db';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  eq,
  and,
} from 'drizzle-orm';

import {
  getCurrentMonth,
} from '@/lib/current-month';

export async function
getCurrentFinancialMonth(
  userId: string
) {

  const currentMonth =
    getCurrentMonth();

  const [month] =
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
            financialMonths
              .referenceMonth,

            currentMonth
          )
        )
      );

    if (month) {

    return month;
  }

  const [createdMonth] =
    await db
      .insert(financialMonths)
      .values({

        userId,

        referenceMonth:
          currentMonth,

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

  return createdMonth;
}