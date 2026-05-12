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

  return month ?? null;
}