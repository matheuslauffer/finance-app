import { db } from '@/db';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  and,
  eq,
} from 'drizzle-orm';

import {
  isAutomaticPaymentMethod,
} from '@/lib/payment-method-behavior';


type Input = {

  userId: string;

  untilReferenceMonth: string;
};

function
addMonth(
  referenceMonth: string
) {

  const [
    year,
    month,
  ] =
    referenceMonth
      .split('-')
      .map(Number);

  const next =
    new Date(
      year,
      month,
      1
    );

  return `${

    next.getFullYear()

  }-${

    String(
      next.getMonth() + 1
    ).padStart(2, '0')

  }`;
}

function
shouldGenerateRecurrenceForMonth(

  recurrence: {
    frequency:
      | 'DAILY'
      | 'WEEKLY'
      | 'BIWEEKLY'
      | 'MONTHLY'
      | 'YEARLY';

    nextOccurrence: string;

    endedAt: string | null;
  },

  referenceMonth: string
) {

  const recurrenceDate =
    new Date(
      recurrence.nextOccurrence
    );

  const recurrenceMonth =
    recurrenceDate

      .toISOString()

      .slice(0, 7);

  /*
  NOT STARTED YET
  */

  if (
    recurrenceMonth
    >
    referenceMonth
  ) {

    return false;
  }

  /*
  ENDED
  */

  if (
    recurrence.endedAt
  ) {

    const endedMonth =
      recurrence.endedAt
        .slice(0, 7);

    if (
      endedMonth
      <
      referenceMonth
    ) {

      return false;
    }
  }

  switch (
    recurrence.frequency
  ) {

    case 'MONTHLY':

      return true;

    case 'YEARLY':

      return (
        recurrenceDate.getMonth()
        ===
        new Date(
          `${referenceMonth}-01`
        ).getMonth()
      );

    default:

      return true;
  }
}

export async function
ensureFinancialProjectionCoverage({
  userId,
  untilReferenceMonth,
}: Input) {

  const activeRecurrences =
    await db

      .select()

      .from(recurrences)

      .where(
        and(

          eq(
            recurrences.userId,
            userId
          ),

          eq(
            recurrences.isActive,
            true
          )
        )
      );

  let currentReferenceMonth =
    new Date()

      .toISOString()

      .slice(0, 7);

  while (

    currentReferenceMonth
    <=
    untilReferenceMonth
  ) {

    const currentMonth =
        new Date()

            .toISOString()

            .slice(0, 7);

        if (
        currentReferenceMonth
        <
        currentMonth
        ) {

        currentReferenceMonth =
            addMonth(
            currentReferenceMonth
            );

        continue;
        }

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
              userId
            ),

            eq(
              financialMonths.referenceMonth,
              currentReferenceMonth
            )
          )
        );

    if (!financialMonth) {

      const [createdMonth] =
        await db

          .insert(financialMonths)

          .values({

            userId,

            referenceMonth:
              currentReferenceMonth,

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
    RECURRENCES
    */

    for (
      const recurrence
      of activeRecurrences
    ) {

      const shouldGenerate =
        shouldGenerateRecurrenceForMonth(

          recurrence,

          currentReferenceMonth
        );

      if (
        !shouldGenerate
      ) {

        continue;
      }

      /*
      EXISTING SNAPSHOT
      */

      const [existingSnapshot] =
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
        existingSnapshot
      ) {

        continue;
      }

      /*
      PAYMENT METHOD
      */

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

        continue;
      }

      const isAutomatic =
        isAutomaticPaymentMethod(
          paymentMethod.methodType
        );

      /*
      DUE DATE
      */

      const dueDate =
        `${currentReferenceMonth}-01`;

      /*
      CREATE SNAPSHOT
      */

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

          dueDate,

          status:
            isAutomatic
              ? 'FULFILLED'
              : 'PROJECTED',
        });
    }

    /*
    NEXT MONTH
    */

    currentReferenceMonth =
      addMonth(
        currentReferenceMonth
      );
  }
}