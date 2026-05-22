import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  and,
  eq,
} from 'drizzle-orm';

type Input = {

  transactionId: string;

  financialMonthId: string;

  categoryId: string;

  amount: string;
};

export async function
reconcileRecurringTransaction({
  transactionId,
  financialMonthId,
  categoryId,
  amount,
}: Input) {

  const [snapshot] =
    await db

      .select()

      .from(
        recurringTransactions
      )

      .where(
        and(

          eq(
            recurringTransactions.financialMonthId,
            financialMonthId
          ),

          eq(
            recurringTransactions.categoryId,
            categoryId
          ),

          eq(
            recurringTransactions.projectedAmount,
            amount
          ),

          eq(
            recurringTransactions.status,
            'PROJECTED'
          )
        )
      );

  if (!snapshot) {

    return null;
  }

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

  await db

    .update(transactions)

    .set({

      recurringTransactionId:
        snapshot.id,
    })

    .where(
      eq(
        transactions.id,
        transactionId
      )
    );

  return snapshot;
}