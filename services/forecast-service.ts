import { db } from '@/db';

import { transactions }
  from '@/db/schema/transactions';

import { forecastSnapshots }
  from '@/db/schema/forecast-snapshots';

import {
  eq,
  and,
} from 'drizzle-orm';

export async function
recalculateForecast(
  userId: string,
  financialMonthId: string
) {

  // 1. Load transactions

  const monthTransactions =
    await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(
            transactions.userId,
            userId
          ),

          eq(
            transactions.financialMonthId,
            financialMonthId
          )
        )
      );

  // 2. Aggregate

  let projectedIncome = 0;

  let projectedExpense = 0;

  let committedAmount = 0;

  for (const tx of monthTransactions) {

    const amount =
      Number(tx.amount);

    if (
      tx.transactionType ===
      'INCOME'
    ) {
      projectedIncome += amount;
    }

    if (
      tx.transactionType ===
      'EXPENSE'
    ) {
      projectedExpense += amount;

      committedAmount += amount;
    }
  }

  const projectedBalance =
    projectedIncome -
    projectedExpense;

  // 3. Burn rate

  const currentDay =
    new Date().getDate();

  const burnRate =
    projectedExpense /
    currentDay;

  // 4. Save snapshot

  const [snapshot] =
    await db
      .insert(forecastSnapshots)
      .values({
        userId,

        financialMonthId,

        projectedIncome:
          projectedIncome.toString(),

        projectedExpense:
          projectedExpense.toString(),

        projectedBalance:
          projectedBalance.toString(),

        committedAmount:
          committedAmount.toString(),

        burnRate:
          burnRate.toFixed(2),

        categoryForecasts: {},
      })
      .returning();

  return snapshot;
}