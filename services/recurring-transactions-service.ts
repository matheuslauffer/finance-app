import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  eq,
  desc,
} from 'drizzle-orm';

export async function
getRecurringTransactions(
  userId: string
) {

  return await db

    .select()

    .from(
      recurringTransactions
    )

    .where(
      eq(
        recurringTransactions.userId,
        userId
      )
    )

    .orderBy(
      desc(
        recurringTransactions
          .createdAt
      )
    );
}