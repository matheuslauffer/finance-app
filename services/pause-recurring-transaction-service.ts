import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  eq,
} from 'drizzle-orm';

export async function
pauseRecurringTransaction(
  recurringTransactionId: string
) {

  await db

    .update(
      recurringTransactions
    )

    .set({

      status:
        'PAUSED',
    })

    .where(
      eq(
        recurringTransactions.id,

        recurringTransactionId
      )
    );
}