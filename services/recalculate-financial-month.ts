import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

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

  let income = 0;

  let expense = 0;

  for (
    const transaction
    of monthTransactions
  ) {

    const amount =
      Number(
        transaction.amount
      );

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
        String(expense),
    })

    .where(
      eq(
        financialMonths.id,
        financialMonthId
      )
    );
}