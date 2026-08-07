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
  transactions,
} from '@/db/schema/transactions';

import {
  eq,
  and,
} from 'drizzle-orm';

import {
  createFinancialOperation,
} from './financial-operation-service';

import {
  recalculateFinancialMonth,
} from './recalculate-financial-month';

import {
  getFinancialCompetencyDate,
} from '@/lib/payment-method-competency';

type Input = {

  userId: string;

  recurringTransactionId: string;

  paidAt?: string | null;
};

export async function
payRecurringTransaction({
  userId,
  recurringTransactionId,
  paidAt,
}: Input) {

  /*
  SNAPSHOT
  */

  const [snapshot] =
    await db

      .select()

      .from(
        recurringTransactions
      )

      .where(
        eq(
          recurringTransactions.id,
          recurringTransactionId
        )
      );

  if (!snapshot) {

    throw new Error(
      'Recurring transaction not found'
    );
  }

  const [existingTransaction] =
    await db

      .select()

      .from(transactions)

      .where(
        and(

          eq(
            transactions.recurringTransactionId,
            snapshot.id
          ),

          eq(
            transactions.status,
            'CONFIRMED'
          )
        )
      );

  if (existingTransaction) {

    return;
  }

  if (
    snapshot.status
    === 'CANCELLED'
  ) {

    return;
  }

  /*
  RECURRENCE
  */

  const [recurrence] =
    await db

      .select()

      .from(
        recurrences
      )

      .where(
        eq(
          recurrences.id,
          snapshot.recurrenceId
        )
      );

  if (!recurrence) {

    throw new Error(
      'Recurrence not found'
    );
  }

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
          snapshot.paymentMethodId
        )
      );

  /*
  PAYMENT DATE
  */

  const paymentDate =
    paidAt

      ? new Date(
          `${paidAt}T00:00:00`
        )

      : getFinancialCompetencyDate({

          occurredAt:
            new Date(
              snapshot.dueDate
            ),

          closingDay:
            paymentMethod
              ?.closingDay
            ?? null,

          dueDay:
            paymentMethod
              ?.dueDay
            ?? null,
        });

  const paymentDateText =
    paymentDate
      .toISOString()
      .split('T')[0];

  /*
  CREATE REAL TRANSACTION
  */

  const result =
    await createFinancialOperation({

    userId,

    operationType:
      'SIMPLE',

    paymentMethodId:
      snapshot.paymentMethodId,

    categoryId:
      snapshot.categoryId,

    description:
      snapshot.description,

    amount:
      snapshot.projectedAmount,

    transactionType:
      snapshot.transactionType,

    status:
      'CONFIRMED',

    occurredAt:
      paymentDate,

    effectiveDate:
      paymentDateText,

    recurringTransactionId:
      snapshot.id,

    dueDate:
      snapshot.dueDate,
  });

  if (!result.transaction) {

    throw new Error(
      'Recurring payment transaction was not created'
    );
  }

  /*
  MARK SNAPSHOT AS FULFILLED
  */

  await db

    .update(
      recurringTransactions
    )

    .set({

      status:
        'FULFILLED',
    })

    .where(
      eq(
        recurringTransactions.id,
        snapshot.id
      )
    );

  /*
  RECALCULATE MONTH
  */

  await recalculateFinancialMonth(
    snapshot.financialMonthId
  );

  if (
    result.transaction.financialMonthId
    !== snapshot.financialMonthId
  ) {

    await recalculateFinancialMonth(
      result.transaction.financialMonthId
    );
  }
}
