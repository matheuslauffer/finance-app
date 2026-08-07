import { db } from '@/db';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  and,
  eq,
  sql,
} from 'drizzle-orm';

import {
  recalculateFinancialMonth,
} from './recalculate-financial-month';

import {
  cleanupWeeklyRecurringDuplicates,
} from './cleanup-weekly-recurring-duplicates-service';

import {
  formatDateOnly,
  getMonthlyDueDate,
  getNextWeekdayDate,
  normalizeDueDay,
  normalizeWeekDay,
} from '@/lib/recurrence-due-date';

type Input = {

  userId: string;

  untilReferenceMonth: string;
};

function
addMonth(
  referenceMonth: string
) {

  const [
    year,
    month,
  ] =
    referenceMonth
      .split('-')
      .map(Number);

  const next =
    new Date(
      year,
      month,
      1
    );

  return `${

    next.getFullYear()

  }-${

    String(
      next.getMonth() + 1
    ).padStart(2, '0')

  }`;
}

function
shouldGenerateRecurrenceForMonth(

  recurrence: {
    frequency:
      | 'DAILY'
      | 'WEEKLY'
      | 'BIWEEKLY'
      | 'MONTHLY'
      | 'YEARLY';

    nextOccurrence: string;

    dueDay: number | null;

    weekDay: number | null;

    endedAt: string | null;
  },

  referenceMonth: string
) {

  const recurrenceDate =
    new Date(
      recurrence.nextOccurrence
    );

  const recurrenceMonth =
    recurrenceDate

      .toISOString()

      .slice(0, 7);

  /*
  NOT STARTED YET
  */

  if (
    recurrenceMonth
    >
    referenceMonth
  ) {

    return false;
  }

  /*
  ENDED
  */

  if (
    recurrence.endedAt
  ) {

    const endedMonth =
      recurrence.endedAt
        .slice(0, 7);

    if (
      endedMonth
      <
      referenceMonth
    ) {

      return false;
    }
  }

  switch (
    recurrence.frequency
  ) {

    case 'MONTHLY':

      return true;

    case 'YEARLY':

      return (
        recurrenceDate.getMonth()
        ===
        new Date(
          `${referenceMonth}-01`
        ).getMonth()
      );

    default:

      return true;
  }
}

export async function
ensureFinancialProjectionCoverage({
  userId,
  untilReferenceMonth,
}: Input) {

  const activeRecurrences =
    await db

      .select()

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
          )
        )
      );

  let currentReferenceMonth =
    new Date()

      .toISOString()

      .slice(0, 7);

  while (

    currentReferenceMonth
    <=
    untilReferenceMonth
  ) {

    /*
    FINANCIAL MONTH
    */

    let [financialMonth] =
      await db

        .select()

        .from(financialMonths)

        .where(
          and(

            eq(
              financialMonths.userId,
              userId
            ),

            eq(
              financialMonths.referenceMonth,
              currentReferenceMonth
            )
          )
        );

    if (!financialMonth) {

      const [createdMonth] =
        await db

          .insert(financialMonths)

          .values({

            userId,

            referenceMonth:
              currentReferenceMonth,

            projectedIncome:
              '0',

            projectedExpense:
              '0',

            projectedBalance:
              '0',

            committedAmount:
              '0',
          })

          .returning();

      financialMonth =
        createdMonth;
    }

    /*
    SKIP PAST MONTHS
    */

    const currentMonth =
      new Date()

        .toISOString()

        .slice(0, 7);

    if (
      currentReferenceMonth
      <
      currentMonth
    ) {

      await recalculateFinancialMonth(
        financialMonth.id
      );

      currentReferenceMonth =
        addMonth(
          currentReferenceMonth
        );

      continue;
    }

    /*
    RECURRENCES
    */

    for (
      const recurrence
      of activeRecurrences
    ) {

      const shouldGenerate =
        shouldGenerateRecurrenceForMonth(

          recurrence,

          currentReferenceMonth
        );

      if (
        !shouldGenerate
      ) {

        continue;
      }

      /*
      DUE DATES
      */

      const dueDates: string[] =
        [];

      /*
      PAYMENT METHOD
      */

      const [
        dueYear,
        dueMonth,
      ] =
        currentReferenceMonth
          .split('-')
          .map(Number);

      if (
        recurrence.frequency
        === 'WEEKLY'
      ) {

        const weekDay =
          normalizeWeekDay(
            recurrence.weekDay
            ??
            new Date(
              recurrence.nextOccurrence
            ).getDay()
          );

        let weeklyDate =
          getNextWeekdayDate({

            fromDate:
              currentReferenceMonth
              ===
              new Date(
                recurrence.nextOccurrence
              )
                .toISOString()
                .slice(0, 7)
                ? new Date(
                    recurrence.nextOccurrence
                  )
                : new Date(
                    dueYear,
                    dueMonth - 1,
                    1
                  ),

            weekDay,
          });

        while (
          weeklyDate.getFullYear()
          === dueYear
          &&
          weeklyDate.getMonth()
          === dueMonth - 1
        ) {

          dueDates.push(
            formatDateOnly(
              weeklyDate
            )
          );

          weeklyDate =
            new Date(
              weeklyDate
            );

          weeklyDate.setDate(
            weeklyDate.getDate() + 7
          );
        }

      } else {

        dueDates.push(
          formatDateOnly(
          getMonthlyDueDate({

            year:
              dueYear,

            monthIndex:
              dueMonth - 1,

            dueDay:
              normalizeDueDay(
                recurrence.dueDay
                ??
                new Date(
                  recurrence.nextOccurrence
                ).getUTCDate()
              ),
          })
          )
        );
      }

      /*
      CREATE SNAPSHOT
      */

      for (
        const dueDate
        of dueDates
      ) {

        const [existingSnapshot] =
          await db

            .select()

            .from(
              recurringTransactions
            )

            .where(
              and(

                eq(
                  recurringTransactions
                    .recurrenceId,

                  recurrence.id
                ),

                eq(
                  recurringTransactions
                    .dueDate,

                  dueDate
                )
              )
            );

        const isMonthlyOrYearly =
          recurrence.frequency === 'MONTHLY'
          || recurrence.frequency === 'YEARLY';

        if (
          isMonthlyOrYearly
        ) {

          const monthSnapshots =
            await db

              .select()

              .from(
                recurringTransactions
              )

              .where(
                and(

                  eq(
                    recurringTransactions
                      .recurrenceId,

                    recurrence.id
                  ),

                  eq(
                    recurringTransactions
                      .financialMonthId,

                    financialMonth.id
                  )
                )
              );

          if (
            monthSnapshots.length > 0
          ) {

            const hasExactDueDate =
              monthSnapshots.some(
                (snapshot) =>
                  String(
                    snapshot.dueDate
                  )
                  ===
                  dueDate
              );

            const hasProjectedOtherDates =
              monthSnapshots.some(
                (snapshot) =>
                  snapshot.status
                  === 'PROJECTED'
                  &&
                  String(
                    snapshot.dueDate
                  )
                  !==
                  dueDate
              );

            if (
              hasExactDueDate
              &&
              hasProjectedOtherDates
            ) {

              await db

                .delete(
                  recurringTransactions
                )

                .where(
                  and(

                    eq(
                      recurringTransactions
                        .recurrenceId,

                      recurrence.id
                    ),

                    eq(
                      recurringTransactions
                        .financialMonthId,

                      financialMonth.id
                    ),

                    eq(
                      recurringTransactions
                        .status,

                      'PROJECTED'
                    ),

                    sql`
                      ${recurringTransactions.dueDate}
                      <> ${dueDate}
                    `
                  )
                );
            }

            const hasFulfilled =
              monthSnapshots.some(
                (snapshot) =>
                  snapshot.status
                  === 'FULFILLED'
              );

            if (
              hasFulfilled
            ) {

              continue;
            }

            if (
              hasExactDueDate
            ) {

              continue;
            }

            if (
              monthSnapshots.some(
                (snapshot) =>
                  snapshot.status
                  === 'PROJECTED'
              )
            ) {

              await db

                .delete(
                  recurringTransactions
                )

                .where(
                  and(

                    eq(
                      recurringTransactions
                        .recurrenceId,

                      recurrence.id
                    ),

                    eq(
                      recurringTransactions
                        .financialMonthId,

                      financialMonth.id
                    ),

                    eq(
                      recurringTransactions
                        .status,

                      'PROJECTED'
                    )
                  )
                );
            }
          }
        }

        if (
          existingSnapshot
        ) {

          continue;
        }

        await db

          .insert(
            recurringTransactions
          )

          .values({

            recurrenceId:
              recurrence.id,

            financialMonthId:
              financialMonth.id,

            categoryId:
              recurrence.categoryId,

            paymentMethodId:
              recurrence.paymentMethodId,

            description:
              recurrence.description,

            transactionType:
              recurrence.transactionType,

            projectedAmount:
              recurrence.amount,

            dueDate,

            status:
              'PROJECTED',
          });
      }

      if (
        recurrence.frequency
        === 'WEEKLY'
      ) {

        await cleanupWeeklyRecurringDuplicates({

          recurrenceId:
            recurrence.id,

          financialMonthId:
            financialMonth.id,

          weekDay:
            normalizeWeekDay(
              recurrence.weekDay
              ??
              new Date(
                recurrence.nextOccurrence
              ).getDay()
            ),
        });
      }
    }

    /*
    RECALCULATE MONTH
    */

    await recalculateFinancialMonth(
      financialMonth.id
    );

    /*
    NEXT MONTH
    */

    currentReferenceMonth =
      addMonth(
        currentReferenceMonth
      );
  }
}
