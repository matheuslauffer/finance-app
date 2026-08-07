import {
  db,
} from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  and,
  eq,
  inArray,
} from 'drizzle-orm';

function getUtcWeekKey(
  value: string | Date
) {

  const date =
    new Date(value);

  const start =
    new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      )
    );

  start.setUTCDate(
    start.getUTCDate()
    -
    start.getUTCDay()
  );

  return start
    .toISOString()
    .slice(0, 10);
}

export async function
cleanupWeeklyRecurringDuplicates({
  recurrenceId,
  financialMonthId,
  weekDay,
}: {
  recurrenceId: string;

  financialMonthId: string;

  weekDay: number;
}) {

  const snapshots =
    await db

      .select({

        id:
          recurringTransactions.id,

        dueDate:
          recurringTransactions.dueDate,
      })

      .from(recurringTransactions)

      .where(
        and(

          eq(
            recurringTransactions.recurrenceId,
            recurrenceId
          ),

          eq(
            recurringTransactions.financialMonthId,
            financialMonthId
          ),

          eq(
            recurringTransactions.status,
            'PROJECTED'
          )
        )
      );

  const snapshotsByWeek =
    new Map<
      string,
      typeof snapshots
    >();

  for (
    const snapshot
    of snapshots
  ) {

    const weekKey =
      getUtcWeekKey(
        snapshot.dueDate
      );

    snapshotsByWeek.set(
      weekKey,
      [
        ...(snapshotsByWeek.get(weekKey) ?? []),
        snapshot,
      ]
    );
  }

  const idsToDelete: string[] =
    [];

  for (
    const weekSnapshots
    of snapshotsByWeek.values()
  ) {

    if (
      weekSnapshots.length <= 1
    ) {

      continue;
    }

    const expectedSnapshot =
      weekSnapshots.find(
        (snapshot) =>
          new Date(
            snapshot.dueDate
          ).getUTCDay()
          === weekDay
      );

    if (!expectedSnapshot) {

      continue;
    }

    idsToDelete.push(
      ...weekSnapshots
        .filter(
          (snapshot) =>
            snapshot.id
            !== expectedSnapshot.id
        )
        .map(
          (snapshot) =>
            snapshot.id
        )
    );
  }

  if (
    idsToDelete.length === 0
  ) {

    return 0;
  }

  await db

    .delete(recurringTransactions)

    .where(
      inArray(
        recurringTransactions.id,
        idsToDelete
      )
    );

  return idsToDelete.length;
}
