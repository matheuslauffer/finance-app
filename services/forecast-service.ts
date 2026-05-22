import { db } from '@/db';

import { transactions }
  from '@/db/schema/transactions';

import { forecastSnapshots }
  from '@/db/schema/forecast-snapshots';

import {
  eq,
} from 'drizzle-orm';

export async function
recalculateForecast(
  financialMonth: {
    id: string;

    userId: string

    status:
      | 'FORECAST'
      | 'OPEN'
      | 'CLOSED';
  }
) {

  if (
    financialMonth.status
    === 'CLOSED'
  ) {

    return;
  }

  // 1. Load transactions

  const monthTransactions =
    await db
      .select()
      .from(transactions)
      .where(
        
          eq(
            transactions.financialMonthId,
            financialMonth.id
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
        userId:
          financialMonth.userId,

        financialMonthId:
          financialMonth.id,

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