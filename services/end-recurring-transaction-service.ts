import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  eq,
} from 'drizzle-orm';

export async function
endRecurringTransaction(
  recurringTransactionId: string
) {

  await db

    .update(
      recurringTransactions
    )

    .set({

      status:
        'ENDED',
    })

    .where(
      eq(
        recurringTransactions.id,

        recurringTransactionId
      )
    );
}