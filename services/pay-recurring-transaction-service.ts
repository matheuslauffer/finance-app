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
  eq,
} from 'drizzle-orm';

import {
  createFinancialOperation,
} from './financial-operation-service';

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

  /*
  ALREADY FULFILLED
  */

  if (
    snapshot.status
    === 'FULFILLED'
  ) {

    return;
  }

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
          snapshot.recurrenceId
        )
      );

  if (!recurrence) {

    throw new Error(
      'Recurrence not found'
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
      new Date(snapshot.dueDate),

    effectiveDate:
      snapshot.dueDate,

    recurringTransactionId:
      snapshot.id,

    dueDate:
    snapshot.dueDate,
  });
}