import { db } from '@/db';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  and,
  eq,
  desc,
  asc,
} from 'drizzle-orm';

type Input = {

  userId: string;

  referenceMonth: string;

  recurringPage: number;

  transactionsPage: number;
};

export async function
getProjectionMonth({
  userId,
  referenceMonth,
  recurringPage,
  transactionsPage,
}: Input) {

  const [financialMonth] =
    await db

      .select()

      .from(financialMonths)

      .where(
        and(

          eq(
            financialMonths.userId,
            userId
          ),

          eq(
            financialMonths.referenceMonth,
            referenceMonth
          )
        )
      );

  if (!financialMonth) {

    return null;
  }

  /*
  RECURRING SNAPSHOTS
  */

  const recurringResult =
    await db

      .select()

      .from(recurringTransactions)

      .where(
        eq(
          recurringTransactions.financialMonthId,
          financialMonth.id
        )
      )

      .orderBy(
        asc(
          recurringTransactions.dueDate
        )
      )

      .limit(6)

      .offset(
        (recurringPage - 1) * 5
      );

  const hasMoreRecurring =
    recurringResult.length > 5;

  const recurringSnapshots =
    recurringResult.slice(0, 5);

  /*
  REALIZED TRANSACTIONS
  */

  const transactionsResult =
    await db

      .select()

      .from(transactions)

      .where(
        eq(
          transactions.financialMonthId,
          financialMonth.id
        )
      )

      .orderBy(
        desc(
          transactions.effectiveDate
        )
      )

      .limit(6)

      .offset(
        (transactionsPage - 1) * 5
      );

  const hasMoreTransactions =
    transactionsResult.length > 5;

  const realizedTransactions =
    transactionsResult.slice(0, 5);

  return {

    financialMonth,

    recurringSnapshots,

    realizedTransactions,

    hasMoreRecurring,

    hasMoreTransactions,
  };
}