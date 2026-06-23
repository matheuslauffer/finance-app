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
  financialMonths,
} from '@/db/schema/financial-months';

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
};

export async function
payRecurringTransaction({
  userId,
  recurringTransactionId,
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
  COMPETENCY DATE
  */

  const competencyDate =
    getFinancialCompetencyDate({

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

  /*
  REFERENCE MONTH
  */

  const referenceMonth =
    `${competencyDate.getFullYear()}-${String(
      competencyDate.getMonth() + 1
    ).padStart(2, '0')}`;

  /*
  FINANCIAL MONTH
  */

  const [financialMonth] =
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

  if (!financialMonth) {

    throw new Error(
      'Financial month not found'
    );
  }

  /*
  CREATE REAL TRANSACTION
  */

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
      competencyDate,

    effectiveDate:
      competencyDate
        .toISOString()
        .split('T')[0],

    recurringTransactionId:
      snapshot.id,

    dueDate:
      competencyDate
        .toISOString()
        .split('T')[0],
  });

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
    financialMonth.id
  );
}
