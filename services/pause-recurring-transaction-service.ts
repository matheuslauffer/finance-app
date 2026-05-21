import { db } from '@/db';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  eq,
} from 'drizzle-orm';

export async function
pauseRecurringTransaction(
  recurrenceId: string
) {

  await db

    .update(
      recurrences
    )

    .set({

      isActive:
        false,
    })

    .where(
      eq(
        recurrences.id,
        recurrenceId
      )
    );
}