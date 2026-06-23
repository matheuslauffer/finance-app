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
  and,
} from 'drizzle-orm';

export async function
recalculateFinancialMonth(
  financialMonthId: string
) {

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

  const monthTransactions =
    await db

      .select()

      .from(transactions)

      .where(
        and(
          eq(
            transactions.financialMonthId,
            financialMonthId
          ),
          eq(
            transactions.status,
            'CONFIRMED'
          )
        )
      );

  let projectedIncome = 0;

  let projectedExpense = 0;

  let committed = 0;

  /*
  PENDING PROJECTIONS
  */

  for (
    const snapshot
    of monthRecurringTransactions
  ) {

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

      projectedIncome += amount;
    }

    if (
      snapshot.transactionType
      === 'EXPENSE'
    ) {

      projectedExpense += amount;

      committed += amount;
    }
  }

  /*
  CONFIRMED TRANSACTIONS
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

      projectedIncome += amount;
    }

    if (
      transaction.transactionType
      === 'EXPENSE'
    ) {

      projectedExpense += amount;
    }
  }

  /*
  BALANCE
  */

  const projectedBalance =
    projectedIncome -
    projectedExpense;

  /*
  UPDATE MONTH
  */

  await db

    .update(financialMonths)

    .set({

      projectedIncome:
        String(projectedIncome),

      projectedExpense:
        String(projectedExpense),

      projectedBalance:
        String(projectedBalance),

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