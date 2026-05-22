import {
  deleteTransaction,
} from './delete-transaction';

import {
  db,
} from '@/db';

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
deleteFinancialOperation(
  transactionId: string
) {

  /*
  TRANSACTION
  */

  const [transaction] =
    await db

      .select()

      .from(transactions)

      .where(
        eq(
          transactions.id,
          transactionId
        )
      );

  if (!transaction) {

    throw new Error(
      'Transaction not found'
    );
  }

  /*
  FINANCIAL MONTH
  */

  const [financialMonth] =
    await db

      .select()

      .from(financialMonths)

      .where(
        eq(
          financialMonths.id,
          transaction.financialMonthId
        )
      );

  /*
  BLOCK CLOSED MONTH
  */

  if (
    financialMonth?.status
    === 'CLOSED'
  ) {

    throw new Error(
      'Financial month is closed'
    );
  }

  /*
  DELETE
  */

  await deleteTransaction(
    transactionId
  );
}