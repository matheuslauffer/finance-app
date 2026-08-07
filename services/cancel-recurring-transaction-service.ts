import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  eq,
} from 'drizzle-orm';

export async function
cancelRecurringTransaction(
  recurringTransactionId: string
) {
  await db

    .update(
      recurringTransactions
    )

    .set({
      status: 'CANCELLED',
    })

    .where(
      eq(
        recurringTransactions.id,
        recurringTransactionId
      )
    );
}
