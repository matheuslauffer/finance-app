import { db } from '@/db';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  and,
  eq,
} from 'drizzle-orm';

import {
  resolveFinancialMonthStatus,
} from '@/lib/financial-month-status';

import {
  resolveFinancialReferenceMonth,
} from '@/lib/resolve-financial-reference-month';

export async function
resolveFinancialMonth(

  userId: string,

  paymentMethodId: string,

  occurredAt: Date,
) {

  /*
  PAYMENT METHOD
  */

  const [paymentMethod] =
    await db

      .select()

      .from(
        paymentMethods
      )

      .where(
        eq(
          paymentMethods.id,
          paymentMethodId
        )
      );

  if (!paymentMethod) {

    throw new Error(
      'Payment method not found'
    );
  }

  /*
  REFERENCE MONTH
  */

    const referenceMonth =
      resolveFinancialReferenceMonth({

        occurredAt,

        paymentMethodType:
          paymentMethod.methodType,

        invoiceClosingDay:
          paymentMethod.closingDay
          ?? undefined,

        invoiceDueDay:
          paymentMethod.dueDay
          ?? undefined,
      });

  /*
  FIND MONTH
  */

  const [existingMonth] =
    await db

      .select()

      .from(
        financialMonths
      )

      .where(
        and(

          eq(
            financialMonths.userId,
            userId
          ),

          eq(
            financialMonths.referenceMonth,
            referenceMonth
          )
        )
      );

  if (existingMonth) {

    return existingMonth;
  }

  /*
  CREATE MONTH
  */

  const [createdMonth] =
    await db

      .insert(
        financialMonths
      )

      .values({

        userId,

        referenceMonth,

        projectedIncome:
          '0',

        projectedExpense:
          '0',

        projectedBalance:
          '0',

        committedAmount:
          '0',

        status:
          resolveFinancialMonthStatus(
            referenceMonth
          ),
      })

      .returning();

  return createdMonth;
}