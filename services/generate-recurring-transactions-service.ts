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

import {
  formatDateOnly,
  getMonthlyDueDate,
  getNextWeekdayDate,
  normalizeDueDay,
  normalizeWeekDay,
} from '@/lib/recurrence-due-date';

function
addFrequency(
  date: Date,

  dueDay: number,

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

      return getMonthlyDueDate({

        year:
          next.getFullYear(),

        monthIndex:
          next.getMonth() + 1,

        dueDay,
      });

    case 'YEARLY':

      return getMonthlyDueDate({

        year:
          next.getFullYear() + 1,

        monthIndex:
          next.getMonth(),

        dueDay,
      });
  }

  return next;
}

export async function
generateRecurringTransactions(
  recurrenceId: string,

  options?: {

    fromDate?: Date;
  }
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
    paymentMethod.methodType,

    paymentMethod.requiresManualPayment
  );

  if (
    !recurrence.isActive
  ) {

    return {

      createdCount:
        0,

      skippedCount:
        0,
    };
  }

  /*
  GENERATE 12 MONTHS
  */

  let createdCount =
    0;

  let skippedCount =
    0;

  const recurrenceStartDate =
    new Date(
      recurrence.nextOccurrence
    );

  const dueDay =
    normalizeDueDay(
      recurrence.dueDay
      ??
      recurrenceStartDate.getUTCDate()
    );

  const weekDay =
    normalizeWeekDay(
      recurrence.weekDay
      ??
      recurrenceStartDate.getDay()
    );

  let currentDate =
    recurrence.frequency === 'WEEKLY'
      ? getNextWeekdayDate({

          fromDate:
            recurrenceStartDate,

          weekDay,
        })
      : getMonthlyDueDate({

          year:
            recurrenceStartDate
              .getFullYear(),

          monthIndex:
            recurrenceStartDate
              .getMonth(),

          dueDay,
        });

  const endedAt =
    recurrence.endedAt
      ? new Date(
          recurrence.endedAt
      )
      : null;

  if (
    options?.fromDate
  ) {

    while (
      currentDate
      <
      options.fromDate
    ) {

      currentDate =
        addFrequency(
          currentDate,
          dueDay,
          recurrence.frequency
        );
    }
  }

  for (
    let index = 0;
    index < 12;
    index++
  ) {

    if (
      endedAt
      &&
      currentDate > endedAt
    ) {

      break;
    }

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
                .dueDate,

              formatDateOnly(
                currentDate
              )
            )
          )
        );

    const isMonthlyOrYearly =
      recurrence.frequency === 'MONTHLY'
      || recurrence.frequency === 'YEARLY';

    if (
      isMonthlyOrYearly
    ) {

      const monthSnapshots =
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

      if (
        monthSnapshots.length > 0
      ) {

        const hasFulfilled =
          monthSnapshots.some(
            (snapshot) =>
              snapshot.status
              === 'FULFILLED'
          );

        if (
          hasFulfilled
        ) {

          skippedCount++;

          currentDate =
            addFrequency(
              currentDate,
              dueDay,
              recurrence.frequency
            );

          continue;
        }

        const hasExactDueDate =
          monthSnapshots.some(
            (snapshot) =>
              String(
                snapshot.dueDate
              )
              ===
              formatDateOnly(
                currentDate
              )
          );

        if (
          hasExactDueDate
        ) {

          skippedCount++;

          currentDate =
            addFrequency(
              currentDate,
              dueDay,
              recurrence.frequency
            );

          continue;
        }

        await db

          .delete(
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
              ),

              eq(
                recurringTransactions
                  .status,

                'PROJECTED'
              )
            )
          );
      }
    }

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
            formatDateOnly(
              currentDate
            ),

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
            formatDateOnly(
              currentDate
            ),

          dueDate:
            formatDateOnly(
              currentDate
            ),

          recurringTransactionId:
            snapshot.id,
        });
      }

      createdCount++;

    } else {

      skippedCount++;
    }

    /*
    NEXT OCCURRENCE
    */

    currentDate =
      addFrequency(
        currentDate,
        dueDay,
        recurrence.frequency
      );
  }
  return {

    createdCount,

    skippedCount,
  };
}
