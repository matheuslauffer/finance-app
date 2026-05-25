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
  PROJECTED RECURRING
  */

  for (
    const snapshot
    of monthRecurringTransactions
  ) {

    /*
    ONLY PENDING PROJECTIONS
    */

    if (
      snapshot.status
      !== 'PROJECTED'
    ) {

      continue;
    }

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

    if (
      transaction.transactionType
      === 'INCOME'
    ) {

      income += amount;
    }

    if (
      transaction.transactionType
      === 'EXPENSE'
    ) {

      expense += amount;

      committed += amount;
    }
  }

  /*
  BALANCE
  */

  const balance =
    income - expense;

  /*
  UPDATE MONTH
  */

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