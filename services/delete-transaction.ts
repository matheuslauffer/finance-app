import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  eq,
} from 'drizzle-orm';

import {
  recalculateFinancialMonth,
} from './recalculate-financial-month';

export async function
deleteTransaction(
  transactionId: string
) {

  const [transaction] =
    await db
      .select()
      .from(
        transactions
      )
      .where(
        eq(
          transactions.id,
          transactionId
        )
      );

  if (!transaction) {

    return;
  }

  await db
    .delete(transactions)
    .where(
      eq(
        transactions.id,
        transactionId
      )
    );

  await recalculateFinancialMonth(
    transaction.financialMonthId
  );
}
