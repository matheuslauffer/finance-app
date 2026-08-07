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
  categories,
} from '@/db/schema/categories';

import {
  and,
  eq,
  desc,
  asc,
  sql,
} from 'drizzle-orm';

import {
  getFinancialCompetencyDate,
} from '@/lib/payment-method-competency';

import {
  ensureFinancialProjectionCoverage,
} from './ensure-financial-projection-coverage-service';

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

  const recurringPageSize = 4;

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
            = 'PROJECTED'
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

      .limit(
        recurringPageSize + 1
      )

      .offset(
        (recurringPage - 1)
        * recurringPageSize
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
    recurringSnapshots.length
    > recurringPageSize;

  /*
  INCLUDE PROJECTED TRANSACTIONS (e.g. installments)
  */

  const projectedTransactionsResult =
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
            transactions.transactionType,
            'EXPENSE'
          ),

          eq(
            transactions.status,
            'PROJECTED'
          )
        )
      )

      .orderBy(
        asc(
          transactions.effectiveDate
        )
      );

  const projectedSnapshots =
    projectedTransactionsResult

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

          paymentMethodType:
            item.paymentMethod
              ?.methodType
            ?? null,

          status:
            'PROJECTED' as const,

          competencyDate,

          projectedAmount:
            item.transaction.amount,

          dueDate:
            item.transaction.dueDate
            ?? item.transaction.effectiveDate,
        };
      });

  // Combine recurring snapshots + projected transactions (installments)
  const combinedCommitments =
    [
      ...recurringSnapshots,
      ...projectedSnapshots,
    ].sort((a, b) => (

      a.competencyDate.getTime()
      -
      b.competencyDate.getTime()
    ));

  const hasMoreCombined =
    combinedCommitments.length > recurringPageSize;

  /*
  PAGINATION (applied on combined commitments)
  */

  const paginatedRecurring =
    combinedCommitments.slice(
      0,
      recurringPageSize
    );

  /*
  REALIZED TRANSACTIONS
  */

  const transactionsPageSize = 7;

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

      .limit(
        transactionsPageSize + 1
      )

      .offset(
        (transactionsPage - 1)
        * transactionsPageSize
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
    realizedTransactions.length
    > transactionsPageSize;

  /*
  PAGINATION
  */

  const paginatedTransactions =
    realizedTransactions.slice(
      0,
      transactionsPageSize
    );

  /*
  EXPENSES BY CATEGORY
  */

  const projectedExpensesByCategory =
    await db

      .select({

        category:
          categories.name,

        total:
          sql<string>`
            sum(
              ${recurringTransactions.projectedAmount}
            )
          `,
      })

      .from(recurringTransactions)

      .leftJoin(

        categories,

        eq(
          categories.id,
          recurringTransactions.categoryId
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

          eq(
            recurringTransactions.status,
            'PROJECTED'
          )
        )
      )

      .groupBy(
        categories.name
      );

  const projectedTransactionsByCategory =
    await db

      .select({

        category:
          categories.name,

        total:
          sql<string>`
            sum(
              ${transactions.amount}
            )
          `,
      })

      .from(transactions)

      .leftJoin(

        categories,

        eq(
          categories.id,
          transactions.categoryId
        )
      )

      .where(
        and(

          eq(
            transactions.financialMonthId,
            financialMonth.id
          ),

          eq(
            transactions.transactionType,
            'EXPENSE'
          ),

          eq(
            transactions.status,
            'PROJECTED'
          )
        )
      )

      .groupBy(
        categories.name
      );

  const realizedExpensesByCategory =
    await db

      .select({

        category:
          categories.name,

        total:
          sql<string>`
            sum(
              ${transactions.amount}
            )
          `,
      })

      .from(transactions)

      .leftJoin(

        categories,

        eq(
          categories.id,
          transactions.categoryId
        )
      )

      .where(
        and(

          eq(
            transactions.userId,
            userId
          ),

          eq(
            transactions.financialMonthId,
            financialMonth.id
          ),

          eq(
            transactions.transactionType,
            'EXPENSE'
          ),

          eq(
            transactions.status,
            'CONFIRMED'
          )
        )
      )

      .groupBy(
        categories.name
      );

  const expensesByCategoryMap =
    new Map<
      string,
      {
        category: string | null;

        total: number;
      }
    >();

  [
    ...projectedExpensesByCategory,
    ...projectedTransactionsByCategory,
    ...realizedExpensesByCategory,
  ].forEach((item) => {

    const key =
      item.category
      ?? 'uncategorized';

    const current =
      expensesByCategoryMap.get(key);

    expensesByCategoryMap.set(
      key,
      {
        category:
          item.category,

        total:
          (
            current?.total
            ?? 0
          )
          + Number(
            item.total
            ?? 0
          ),
      }
    );
  });

  return {

    financialMonth,

    recurringSnapshots:
      paginatedRecurring,

    realizedTransactions:
      paginatedTransactions,

    hasMoreRecurring,

    hasMoreTransactions,

    expensesByCategory:
      Array.from(
        expensesByCategoryMap.values()
      ),
  };
}
