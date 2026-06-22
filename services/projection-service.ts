import { db } from '@/db';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  and,
  eq,
  desc,
  asc,
} from 'drizzle-orm';

import {
  getFinancialCompetencyDate,
} from '@/lib/payment-method-competency';

type Input = {

  userId: string;

  referenceMonth: string;

  recurringPage: number;

  transactionsPage: number;
};

export async function
getProjectionMonth({
  userId,
  referenceMonth,
  recurringPage,
  transactionsPage,
}: Input) {

  const [financialMonth] =
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
            referenceMonth
          )
        )
      );

  if (!financialMonth) {

    return null;
  }

  /*
  RECURRING SNAPSHOTS
  */

  const recurringResult =
    await db

      .select({

        recurring:
          recurringTransactions,

        paymentMethod:
          paymentMethods,
      })

      .from(recurringTransactions)

      .leftJoin(

        paymentMethods,

        eq(
          recurringTransactions.paymentMethodId,
          paymentMethods.id
        )
      )

      .where(
        eq(
          recurringTransactions.financialMonthId,
          financialMonth.id
        )
      )

      .orderBy(
        asc(
          recurringTransactions.dueDate
        )
      )

      .limit(6)

      .offset(
        (recurringPage - 1) * 5
      );

  const recurringSnapshots =
    recurringResult

      .map((item) => {

        const competencyDate =
          getFinancialCompetencyDate({

            occurredAt:
              new Date(
                item.recurring.dueDate
              ),

            closingDay:
              item.paymentMethod
                ?.closingDay
              ?? null,

            dueDay:
              item.paymentMethod
                ?.dueDay
              ?? null,
          });

        return {

          ...item.recurring,

          competencyDate,
        };
      })

      .sort((a, b) => (

        a.competencyDate.getTime()
        -
        b.competencyDate.getTime()
      ));

  const hasMoreRecurring =
    recurringSnapshots.length > 5;

  /*
  PAGINATION
  */

  const paginatedRecurring =
    recurringSnapshots.slice(0, 5);

  /*
  REALIZED TRANSACTIONS
  */

  const transactionsResult =
    await db

      .select({

        transaction:
          transactions,

        paymentMethod:
          paymentMethods,
      })

      .from(transactions)

      .leftJoin(

        paymentMethods,

        eq(
          transactions.paymentMethodId,
          paymentMethods.id
        )
      )

      .where(
        eq(
          transactions.financialMonthId,
          financialMonth.id
        )
      )

      .orderBy(
        desc(
          transactions.effectiveDate
        )
      )

      .limit(6)

      .offset(
        (transactionsPage - 1) * 5
      );

  const realizedTransactions =
    transactionsResult

      .map((item) => {

        const competencyDate =
          getFinancialCompetencyDate({

            occurredAt:
              new Date(
                item.transaction.effectiveDate
              ),

            closingDay:
              item.paymentMethod
                ?.closingDay
              ?? null,

            dueDay:
              item.paymentMethod
                ?.dueDay
              ?? null,
          });

        return {

          ...item.transaction,

          competencyDate,
        };
      })

      .sort((a, b) => (

        b.competencyDate.getTime()
        -
        a.competencyDate.getTime()
      ));

  const hasMoreTransactions =
    realizedTransactions.length > 5;

  /*
  PAGINATION
  */

  const paginatedTransactions =
    realizedTransactions.slice(0, 5);

  return {

    financialMonth,

    recurringSnapshots:
      paginatedRecurring,

    realizedTransactions:
      paginatedTransactions,

    hasMoreRecurring,

    hasMoreTransactions,
  };
}