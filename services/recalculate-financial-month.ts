import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  eq,
} from 'drizzle-orm';

export async function
recalculateFinancialMonth(
  financialMonthId: string
) {

  /*
  REALIZED
  */

  const monthTransactions =
    await db

      .select()

      .from(transactions)

      .where(
        eq(
          transactions
            .financialMonthId,

          financialMonthId
        )
      );

  /*
  FORECAST
  */

  const monthRecurringTransactions =
    await db

      .select()

      .from(
        recurringTransactions
      )

      .where(
        eq(
          recurringTransactions
            .financialMonthId,

          financialMonthId
        )
      );

  let income = 0;

  let expense = 0;

  let committed = 0;

  /*
  RECURRING SNAPSHOTS
  */

  for (
    const snapshot
    of monthRecurringTransactions
  ) {

    const amount =
      Number(
        snapshot.projectedAmount
      );

    if (
      snapshot.transactionType
      === 'INCOME'
    ) {

      income += amount;
    }

    if (
      snapshot.transactionType
      === 'EXPENSE'
    ) {

      expense += amount;

      committed += amount;
    }
  }

  /*
  REALIZED TRANSACTIONS
  */

  for (
    const transaction
    of monthTransactions
  ) {

    const amount =
      Number(
        transaction.amount
      );

    /*
    AVOID DOUBLE COUNT
    */

    if (
      transaction
        .recurringTransactionId
    ) {

      continue;
    }

    if (
      transaction
        .transactionType
      === 'INCOME'
    ) {

      income += amount;
    }

    if (
      transaction
        .transactionType
      === 'EXPENSE'
    ) {

      expense += amount;

      committed += amount;
    }
  }

  const balance =
    income - expense;

  await db

    .update(financialMonths)

    .set({

      projectedIncome:
        String(income),

      projectedExpense:
        String(expense),

      projectedBalance:
        String(balance),

      committedAmount:
        String(committed),
    })

    .where(
      eq(
        financialMonths.id,
        financialMonthId
      )
    );
}