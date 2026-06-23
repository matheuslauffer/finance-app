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
  lte,
  sql,
} from 'drizzle-orm';

import {
  getFinancialCompetencyDate,
} from '@/lib/payment-method-competency';

import {
  ensureFinancialProjectionCoverage,
} from './ensure-financial-projection-coverage-service';

import {
  payRecurringTransaction,
} from './pay-recurring-transaction-service';

type Input = {

  userId: string;

  referenceMonth: string;

  recurringPage: number;

  transactionsPage: number;
};

async function
payDueCreditCardRecurringTransactions({
  userId,
  financialMonthId,
}: {
  userId: string;

  financialMonthId: string;
}) {

  const today =
    new Date()
      .toISOString()
      .split('T')[0];

  const dueCreditCardItems =
    await db

      .select({

        id:
          recurringTransactions.id,
      })

      .from(recurringTransactions)

      .innerJoin(

        paymentMethods,

        eq(
          recurringTransactions.paymentMethodId,
          paymentMethods.id
        )
      )

      .where(
        and(

          eq(
            recurringTransactions.financialMonthId,
            financialMonthId
          ),

          eq(
            recurringTransactions.transactionType,
            'EXPENSE'
          ),

          eq(
            paymentMethods.methodType,
            'CREDIT_CARD'
          ),

          lte(
            recurringTransactions.dueDate,
            today
          ),

          sql`
            ${recurringTransactions.status}
            <> 'CANCELLED'
          `,

          sql`
            not exists (
              select
                1
              from
                transactions
              where
                transactions.recurring_transaction_id
                =
                ${recurringTransactions.id}::text
              and
                transactions.status
                =
                'CONFIRMED'
            )
          `
        )
      );

  for (
    const item
    of dueCreditCardItems
  ) {

    await payRecurringTransaction({

      userId,

      recurringTransactionId:
        item.id,
    });
  }
}

export async function
getProjectionMonth({
  userId,
  referenceMonth,
  recurringPage,
  transactionsPage,
}: Input) {

  await ensureFinancialProjectionCoverage({

    userId,

    untilReferenceMonth:
      referenceMonth,
  });

  const [initialFinancialMonth] =
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

  if (!initialFinancialMonth) {

    return null;
  }

  await payDueCreditCardRecurringTransactions({

    userId,

    financialMonthId:
      initialFinancialMonth.id,
  });

  const [financialMonth] =
    await db

      .select()

      .from(financialMonths)

      .where(
        eq(
          financialMonths.id,
          initialFinancialMonth.id
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
        and(

          eq(
            recurringTransactions.financialMonthId,
            financialMonth.id
          ),

          eq(
            recurringTransactions.transactionType,
            'EXPENSE'
          ),

          sql`
            ${recurringTransactions.status}
            <> 'CANCELLED'
          `,

          sql`
            not exists (
              select
                1
              from
                transactions
              where
                transactions.recurring_transaction_id
                =
                ${recurringTransactions.id}::text
              and
                transactions.status
                =
                'CONFIRMED'
            )
          `
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

          paymentMethodType:
            item.paymentMethod
              ?.methodType
            ?? null,

          status:
            'PROJECTED' as const,

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
        and(

          eq(
            transactions.financialMonthId,
            financialMonth.id
          ),

          eq(
            transactions.status,
            'CONFIRMED'
          ),

          eq(
            transactions.transactionType,
            'EXPENSE'
          )
        )
      )

      .orderBy(

        desc(
          transactions.effectiveDate
        ),

        desc(
          transactions.createdAt
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
      });

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
