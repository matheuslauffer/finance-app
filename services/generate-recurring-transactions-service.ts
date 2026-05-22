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

import{
  isAutomaticPaymentMethod,
} from '@/lib/payment-method-behavior';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  createFinancialOperation,
} from '@/services/financial-operation-service';
;

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

  const [paymentMethod] =
  await db

    .select()

    .from(paymentMethods)

    .where(
      eq(
        paymentMethods.id,
        recurrence.paymentMethodId
      )
    );

  if (!paymentMethod) {

    throw new Error(
      'Payment method not found'
    );
  }

  const isAutomatic =
  isAutomaticPaymentMethod(
    paymentMethod.methodType
  );

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

      const [snapshot] =
        await db

        .insert(
          recurringTransactions
        )

        .values({

          recurrenceId:
            recurrence.id,

          financialMonthId:
            financialMonth.id,

          categoryId:
            recurrence.categoryId,

          paymentMethodId:
            recurrence.paymentMethodId,

          description:
            recurrence.description,

          transactionType:
            recurrence.transactionType,

          projectedAmount:
            recurrence.amount,

          dueDate:
            currentDate
              .toISOString()
              .split('T')[0],

          status:
            isAutomatic
              ? 'FULFILLED'
              : 'PROJECTED',
        })

      .returning();

      if (isAutomatic) {

        await createFinancialOperation({

          userId:
            recurrence.userId,

          paymentMethodId:
            recurrence.paymentMethodId,

          categoryId:
            recurrence.categoryId,

          description:
            recurrence.description,

          amount:
            recurrence.amount,

          operationType:
            'PURCHASE',

          transactionType:
            recurrence.transactionType,

          status:
            'CONFIRMED',

          occurredAt:
            currentDate,

          effectiveDate:
            currentDate
              .toISOString()
              .split('T')[0],

          dueDate:
            currentDate
              .toISOString()
              .split('T')[0],

          recurringTransactionId:
            snapshot.id,
        });
      }

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