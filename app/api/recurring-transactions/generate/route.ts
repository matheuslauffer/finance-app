import {
  auth,
} from '@clerk/nextjs/server';

import {
  db,
} from '@/db';

import {
  generateRecurringTransactions,
} from '@/services/generate-recurring-transactions-service';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  and,
  eq,
  isNull,
} from 'drizzle-orm';

export async function
POST() {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    return Response.json(
      {
        error:
          'Unauthorized',
      },

      {
        status: 401,
      }
    );
  }

  const activeRecurrences =
    await db

      .select({

        id:
          recurrences.id,
      })

      .from(recurrences)

      .where(
        and(

          eq(
            recurrences.userId,
            userId
          ),

          eq(
            recurrences.isActive,
            true
          ),

          isNull(
            recurrences.endedAt
          )
        )
      );

  let createdCount =
    0;

  let skippedCount =
    0;

  for (
    const recurrence
    of activeRecurrences
  ) {

    const result =
      await generateRecurringTransactions(
        recurrence.id
      );

    createdCount +=
      result.createdCount;

    skippedCount +=
      result.skippedCount;
  }


  return Response.json(
    {
      createdCount,

      skippedCount,
    }
  );
}
