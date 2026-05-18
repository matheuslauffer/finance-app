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

type ProjectedTransaction = {

  description: string;

  amount: number;

  transactionType:
    | 'INCOME'
    | 'EXPENSE';

  frequency:
    | 'DAILY'
    | 'WEEKLY'
    | 'BIWEEKLY'
    | 'MONTHLY'
    | 'YEARLY';

  projectedOccurrences:
    number;

  projectedTotal:
    number;

    recurringTransactionId:
        string;
};

function
getOccurrencesInMonth(

  frequency:
    | 'DAILY'
    | 'WEEKLY'
    | 'BIWEEKLY'
    | 'MONTHLY'
    | 'YEARLY',

  month: string
) {

  const [
    year,
    monthNumber,
  ] = month
    .split('-')
    .map(Number);

  const daysInMonth =
    new Date(
      year,
      monthNumber,
      0
    ).getDate();

  switch (
    frequency
  ) {

    case 'DAILY':

      return daysInMonth;

    case 'WEEKLY':

      return Math.ceil(
        daysInMonth / 7
      );

    case 'BIWEEKLY':

      return Math.ceil(
        daysInMonth / 14
      );

    case 'MONTHLY':

      return 1;

    case 'YEARLY':

      return (
        monthNumber === 1
      )
        ? 1
        : 0;

    default:

      return 0;
  }
}

export async function
getProjectedTransactions(
  userId: string,

  month: string
){
    const [
        year,
        monthNumber,
        ] = month
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
        getOccurrencesInMonth(

          item.frequency,

          month
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

