import { db } from '@/db';

import {
  recurringTransactions,
} from '../db/schema/recurring-transactions';

import {
  and,
  eq,
  isNull,
  lte,
  or,
  gte,
} from 'drizzle-orm';

function
getOccurrencesInWindow(

  frequency:
    | 'DAILY'
    | 'WEEKLY'
    | 'BIWEEKLY'
    | 'MONTHLY'
    | 'YEARLY',

  effectiveFrom: string,

  effectiveUntil: string | null,

  monthStart: string,

  monthEnd: string
) {

  const start =
    effectiveFrom > monthStart
      ? effectiveFrom
      : monthStart;

  const end =
    effectiveUntil
    && effectiveUntil < monthEnd
      ? effectiveUntil
      : monthEnd;

  if (
    start > end
  ) {

    return 0;
  }

  const startDate =
    new Date(
      `${start}T00:00:00`
    );

  const endDate =
    new Date(
      `${end}T00:00:00`
    );

  const days =
    Math.floor(
      (
        endDate.getTime()
        - startDate.getTime()
      )
      / 86400000
    )
    + 1;

  switch (
    frequency
  ) {

    case 'DAILY':

      return days;

    case 'WEEKLY':

      return Math.ceil(
        days / 7
      );

    case 'BIWEEKLY':

      return Math.ceil(
        days / 14
      );

    case 'MONTHLY':

      return 1;

    case 'YEARLY': {

      const baseDate =
        new Date(
          `${effectiveFrom}T00:00:00`
        );

      return (
        baseDate.getMonth()
        === startDate.getMonth()
        && baseDate.getDate()
        >= startDate.getDate()
        && baseDate.getDate()
        <= endDate.getDate()
      )
        ? 1
        : 0;
    }

    default:

      return 0;
  }
}

export async function
getProjectedTransactions(

  userId: string,

  month: string
) {

  const [
    year,
    monthNumber,
  ] =
    month
      .split('-')
      .map(Number);

  const lastDay =
    new Date(
      year,
      monthNumber,
      0
    ).getDate();

  const monthStart =
    `${month}-01`;

  const monthEnd =
    `${month}-${String(
      lastDay
    ).padStart(2, '0')}`;

  const recurring =
    await db

      .select()

      .from(
        recurringTransactions
      )

      .where(
        and(

          eq(
            recurringTransactions.userId,
            userId
          ),

          eq(
            recurringTransactions.status,
            'ACTIVE'
          ),

          lte(
            recurringTransactions
              .effectiveFrom,

            monthEnd
          ),

          or(

            isNull(
              recurringTransactions
                .effectiveUntil
            ),

            gte(
              recurringTransactions
                .effectiveUntil,

              monthStart
            )
          )
        )
      );

  const projections =
    recurring.map(
      (item) => {

        const projectedOccurrences =
          getOccurrencesInWindow(

            item.frequency,

            item.effectiveFrom,

            item.effectiveUntil,

            monthStart,

            monthEnd
          );

        const amount =
          Number(
            item.amount
          );

        return {

          description:
            item.description,

          amount,

          transactionType:
            item.transactionType,

          frequency:
            item.frequency,

          projectedOccurrences,

          projectedTotal:
            amount
            * projectedOccurrences,

          recurringTransactionId:
            item.id,
        };
      }
    );

  return projections;
}