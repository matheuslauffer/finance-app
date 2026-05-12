import { db } from '@/db';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  eq,
  and,
} from 'drizzle-orm';

import {
  getFinancialMonthDate,
} from '@/lib/financial-month';

export async function
resolveFinancialMonth(
  userId: string,
  paymentMethodId: string,
  occurredAt: Date
) {

  // 1. Load payment method

  const [paymentMethod] =
    await db
      .select()
      .from(paymentMethods)
      .where(
        eq(
          paymentMethods.id,
          paymentMethodId
        )
      );

  // 2. Resolve month date

  const referenceMonth =
    getFinancialMonthDate(
      occurredAt,
      paymentMethod?.closingDay
    );

  const monthString =
    referenceMonth
      .toISOString()
      .split('T')[0];

  // 3. Check existing month

  const [existingMonth] =
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

            monthString
          )
        )
      );

  if (existingMonth) {
    return existingMonth;
  }

  // 4. Create month automatically

  const [createdMonth] =
    await db
      .insert(financialMonths)
      .values({
        userId,

        referenceMonth:
          monthString,
      })
      .returning();

  return createdMonth;
}