import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  eq,
} from 'drizzle-orm';

export async function
deleteFinancialOperation(
  transactionId: string
) {

  await db

    .delete(
      transactions
    )

    .where(
      eq(
        transactions.id,

        transactionId
      )
    );
}