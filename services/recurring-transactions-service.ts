import { db } from '@/db';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  desc,
  eq,
} from 'drizzle-orm';

export async function
getRecurringTransactions(
  userId: string
) {

  return await db

    .select()

    .from(
      recurrences
    )

    .where(
      eq(
        recurrences.userId,
        userId
      )
    )

    .orderBy(
      desc(
        recurrences.nextOccurrence
      )
    );
}