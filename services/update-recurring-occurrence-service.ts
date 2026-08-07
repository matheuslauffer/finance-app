import {
  db,
} from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  and,
  eq,
} from 'drizzle-orm';

import {
  recalculateFinancialMonth,
} from './recalculate-financial-month';

type Input = {

  userId: string;

  recurringTransactionId: string;

  paymentMethodId: string;

  projectedAmount: string;

  dueDate: string;
};

export async function
updateRecurringOccurrence({
  userId,
  recurringTransactionId,
  paymentMethodId,
  projectedAmount,
  dueDate,
}: Input) {

  const [paymentMethod] =
    await db

      .select({
        id:
          paymentMethods.id,
      })

      .from(paymentMethods)

      .where(
        and(

          eq(
            paymentMethods.id,
            paymentMethodId
          ),

          eq(
            paymentMethods.userId,
            userId
          )
        )
      );

  if (!paymentMethod) {

    throw new Error(
      'Payment method not found'
    );
  }

  const [snapshot] =
    await db

      .select({

        id:
          recurringTransactions.id,

        financialMonthId:
          recurringTransactions.financialMonthId,
      })

      .from(recurringTransactions)

      .innerJoin(

        recurrences,

        eq(
          recurringTransactions.recurrenceId,
          recurrences.id
        )
      )

      .where(
        and(

          eq(
            recurringTransactions.id,
            recurringTransactionId
          ),

          eq(
            recurringTransactions.status,
            'PROJECTED'
          ),

          eq(
            recurrences.userId,
            userId
          )
        )
      );

  if (!snapshot) {

    throw new Error(
      'Recurring occurrence not found'
    );
  }

  await db

    .update(recurringTransactions)

    .set({

      paymentMethodId,

      projectedAmount,

      dueDate,
    })

    .where(
      eq(
        recurringTransactions.id,
        recurringTransactionId
      )
    );

  await recalculateFinancialMonth(
    snapshot.financialMonthId
  );
}
