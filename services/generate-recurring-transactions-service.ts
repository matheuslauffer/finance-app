import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  and,
  eq,
  gte,
  isNull,
  lte,
  or,
} from 'drizzle-orm';

import {
  resolveFinancialMonth,
} from './financial-month-service';

import {
  recalculateFinancialMonth,
} from './recalculate-financial-month';

type Frequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'YEARLY';

type GeneratedRecurringTransactionsResult = {

  month: string;

  createdCount: number;

  skippedCount: number;
};

function
parseDate(
  value: string
) {

  return new Date(
    `${value}T00:00:00`
  );
}

function
formatDate(
  date: Date
) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      date.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function
addDays(
  date: Date,

  days: number
) {

  const result =
    new Date(
      date
    );

  result.setDate(
    result.getDate()
    + days
  );

  return result;
}

function
getDaysBetween(
  start: Date,

  end: Date
) {

  return Math.floor(
    (
      end.getTime()
      - start.getTime()
    )
    / 86400000
  );
}

function
getLastDayOfMonth(
  year: number,

  monthIndex: number
) {

  return new Date(
    year,
    monthIndex + 1,
    0
  ).getDate();
}

function
createDateWithClampedDay(
  year: number,

  monthIndex: number,

  day: number
) {

  return new Date(
    year,
    monthIndex,
    Math.min(
      day,
      getLastDayOfMonth(
        year,
        monthIndex
      )
    )
  );
}

function
isInsideWindow(
  date: Date,

  windowStart: Date,

  windowEnd: Date
) {

  return (
    date >= windowStart
    && date <= windowEnd
  );
}

function
getOccurrenceDates(
  frequency: Frequency,

  effectiveFrom: string,

  effectiveUntil: string | null,

  monthStart: string,

  monthEnd: string
) {

  const startDate =
    parseDate(
      effectiveFrom > monthStart
        ? effectiveFrom
        : monthStart
    );

  const endDate =
    parseDate(
      effectiveUntil
      && effectiveUntil < monthEnd
        ? effectiveUntil
        : monthEnd
    );

  if (
    startDate > endDate
  ) {

    return [];
  }

  const anchorDate =
    parseDate(
      effectiveFrom
    );

  if (
    frequency === 'DAILY'
  ) {

    const dates: string[] =
      [];

    for (
      let current = startDate;
      current <= endDate;
      current = addDays(
        current,
        1
      )
    ) {

      dates.push(
        formatDate(
          current
        )
      );
    }

    return dates;
  }

  if (
    frequency === 'WEEKLY'
    || frequency === 'BIWEEKLY'
  ) {

    const intervalDays =
      frequency === 'WEEKLY'
        ? 7
        : 14;

    const daysUntilWindow =
      getDaysBetween(
        anchorDate,
        startDate
      );

    const intervalsToSkip =
      Math.max(
        0,
        Math.ceil(
          daysUntilWindow
          / intervalDays
        )
      );

    const dates: string[] =
      [];

    for (
      let current =
        addDays(
          anchorDate,
          intervalsToSkip
          * intervalDays
        );
      current <= endDate;
      current = addDays(
        current,
        intervalDays
      )
    ) {

      if (
        current >= startDate
      ) {

        dates.push(
          formatDate(
            current
          )
        );
      }
    }

    return dates;
  }

  const [
    year,
    monthNumber,
  ] =
    monthStart
      .slice(0, 7)
      .split('-')
      .map(Number);

  if (
    frequency === 'MONTHLY'
  ) {

    const occurrenceDate =
      createDateWithClampedDay(
        year,
        monthNumber - 1,
        anchorDate.getDate()
      );

    return isInsideWindow(
      occurrenceDate,
      startDate,
      endDate
    )
      ? [
          formatDate(
            occurrenceDate
          ),
        ]
      : [];
  }

  if (
    frequency === 'YEARLY'
  ) {

    if (
      anchorDate.getMonth()
      !== monthNumber - 1
    ) {

      return [];
    }

    const occurrenceDate =
      createDateWithClampedDay(
        year,
        monthNumber - 1,
        anchorDate.getDate()
      );

    return isInsideWindow(
      occurrenceDate,
      startDate,
      endDate
    )
      ? [
          formatDate(
            occurrenceDate
          ),
        ]
      : [];
  }

  return [];
}

export async function
generateRecurringTransactions(
  userId: string,

  month: string
): Promise<GeneratedRecurringTransactionsResult>
{

  const [
    year,
    monthNumber,
  ] =
    month
      .split('-')
      .map(Number);

  const lastDay =
    getLastDayOfMonth(
      year,
      monthNumber - 1
    );

  const monthStart =
    `${month}-01`;

  const monthEnd =
    `${month}-${String(
      lastDay
    ).padStart(2, '0')}`;

  const activeRecurringTransactions =
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

  const existingTransactions =
    await db

      .select({

        recurringTransactionId:
          transactions
            .recurringTransactionId,

        effectiveDate:
          transactions
            .effectiveDate,
      })

      .from(
        transactions
      )

      .where(
        and(

          eq(
            transactions.userId,
            userId
          ),

          gte(
            transactions.effectiveDate,
            monthStart
          ),

          lte(
            transactions.effectiveDate,
            monthEnd
          )
        )
      );

  const existingGeneratedKeys =
    new Set(
      existingTransactions
        .filter(
          (transaction) => (
            Boolean(
              transaction
                .recurringTransactionId
            )
          )
        )
        .map(
          (transaction) => (
            `${transaction.recurringTransactionId}:${transaction.effectiveDate}`
          )
        )
    );

  const affectedFinancialMonthIds =
    new Set<string>();

  let createdCount =
    0;

  let skippedCount =
    0;

  for (
    const recurring
    of activeRecurringTransactions
  ) {

    const occurrenceDates =
      getOccurrenceDates(

        recurring.frequency,

        recurring.effectiveFrom,

        recurring.effectiveUntil,

        monthStart,

        monthEnd
      );

    for (
      const occurrenceDate
      of occurrenceDates
    ) {

      const existingKey =
        `${recurring.id}:${occurrenceDate}`;

      if (
        existingGeneratedKeys.has(
          existingKey
        )
      ) {

        skippedCount += 1;

        continue;
      }

      const occurredAt =
        parseDate(
          occurrenceDate
        );

      const financialMonth =
        await resolveFinancialMonth(

          userId,

          recurring.paymentMethodId,

          occurredAt
        );

      await db

        .insert(
          transactions
        )

        .values({

          userId,

          paymentMethodId:
            recurring.paymentMethodId,

          categoryId:
            recurring.categoryId,

          financialMonthId:
            financialMonth.id,

          description:
            recurring.description,

          amount:
            recurring.amount,

          transactionType:
            recurring.transactionType,

          status:
            'PROJECTED',

          occurredAt,

          effectiveDate:
            occurrenceDate,

          recurringTransactionId:
            recurring.id,
        });

      existingGeneratedKeys.add(
        existingKey
      );

      affectedFinancialMonthIds.add(
        financialMonth.id
      );

      createdCount += 1;
    }
  }

  for (
    const financialMonthId
    of affectedFinancialMonthIds
  ) {

    await recalculateFinancialMonth(
      financialMonthId
    );
  }

  return {

    month,

    createdCount,

    skippedCount,
  };
}
