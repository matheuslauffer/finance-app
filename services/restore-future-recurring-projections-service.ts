import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  transactions,
} from '@/db/schema/transactions';

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
  referenceMonth?: string;
};

export async function
restoreFutureRecurringProjections({
  referenceMonth,
}: Input = {}) {

  const snapshots =
    await db

      .select({
        id:
          recurringTransactions.id,
        financialMonthId:
          recurringTransactions.financialMonthId,
      })

      .from(
        recurringTransactions
      )

      .leftJoin(

        paymentMethods,

        eq(
          recurringTransactions.paymentMethodId,
          paymentMethods.id
        )
      )

      .where(
        and(

          eq(
            recurringTransactions.status,
            'FULFILLED'
          ),

          eq(
            paymentMethods.methodType,
            'CREDIT_CARD'
          )
        )
      );

  const affectedSnapshotIds =
    snapshots.map(
      (snapshot) =>
        snapshot.id
    );

  if (
    affectedSnapshotIds.length === 0
  ) {

    return {
      restoredCount:
        0,
    };
  }

  const affectedMonthIds =
    new Set<string>();

  for (
    const snapshotId
    of affectedSnapshotIds
  ) {

    const [snapshot] =
      await db

        .select({
          financialMonthId:
            recurringTransactions.financialMonthId,
        })

        .from(
          recurringTransactions
        )

        .where(
          eq(
            recurringTransactions.id,
            snapshotId
          )
        );

    if (snapshot) {

      affectedMonthIds.add(
        snapshot.financialMonthId
      );
    }

    await db

      .update(
        recurringTransactions
      )

      .set({
        status:
          'PROJECTED',
      })

      .where(
        eq(
          recurringTransactions.id,
          snapshotId
        )
      );

    const relatedTransactions =
      await db

        .select({
          id:
            transactions.id,
          financialMonthId:
            transactions.financialMonthId,
        })

        .from(
          transactions
        )

        .where(
          and(

            eq(
              transactions.recurringTransactionId,
              snapshotId
            ),

            eq(
              transactions.status,
              'CONFIRMED'
            )
          )
        );

    for (
      const relatedTransaction
      of relatedTransactions
    ) {

      affectedMonthIds.add(
        relatedTransaction.financialMonthId
      );

      await db

        .update(
          transactions
        )

        .set({
          status:
            'PROJECTED',
        })

        .where(
          eq(
            transactions.id,
            relatedTransaction.id
          )
        );
    }
  }

  for (
    const monthId
    of affectedMonthIds
  ) {

    await recalculateFinancialMonth(
      monthId
    );
  }

  return {
    restoredCount:
      affectedSnapshotIds.length,
  };
}
