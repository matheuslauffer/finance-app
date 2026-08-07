import { db } from '@/db';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  categories,
} from '@/db/schema/categories';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  getCurrentFinancialMonth,
} from './current-financial-month-service';

import {
  getProjectedTransactions,
} from './recurring-projection-service';

import {
  eq,
  and,
  desc,
  asc,
  lte,
  sql,
} from 'drizzle-orm';

type DashboardData = {

  currentMonth: {

    referenceMonth:
      string;
  };

  projectedIncome:
    number;

  projectedExpense:
    number;

  projectedBalance:
    number;

  committedAmount:
    number;

  commitmentPercentage:
    number;

  monthlyBalance:
    number;

  recentMonths: {

    referenceMonth:
      string;

    projectedBalance:
      number;

  }[];

  expensesByCategory: {

    category:
      string | null;

    total:
      number;

  }[];

  monthlyCashFlow: {

    referenceMonth:
      string;

    realized:
      number;

    projected:
      number;

  }[];

  operationalSummary: {

    pendingAmount:
      number;

    pendingCount:
      number;

    overdueAmount:
      number;

    overdueCount:
      number;

    paidThisMonth:
      number;

    expectedThisMonth:
      number;
  };

  weeklyExpenses: {

    id:
      string;

    description:
      string;

    amount:
      number;

    effectiveDate:
      string;

    paymentMethodName:
      string | null;

    paymentMethodId:
      string;

    recurringTransactionId:
      string;

    referenceMonth:
      string;

  }[];

  hasMorePending: boolean;

  pendingPage: number;

  paymentMethods: {

    id:
      string;

    name:
      string;

  }[];

  recentTransactions: {

    id:
      string;

    description:
      string;

    amount:
      number;

    transactionType:
      string;

    createdAt:
      Date;

  }[];
};

export async function
getCurrentDashboard(
  userId: string,
  options?: {
    pendingPage?: number;
    pendingPageSize?: number;
  }
): Promise<DashboardData>
{

  /*
  CURRENT MONTH
  */

  const currentMonth =
    await getCurrentFinancialMonth(
      userId
    );

  const [currentFinancialMonth] =
    await db

      .select()

      .from(
        financialMonths
      )

      .where(
        and(

          eq(
            financialMonths.userId,
            userId
          ),

          eq(
            financialMonths.referenceMonth,
            currentMonth.referenceMonth
          )
        )
      );

  /*
  RECENT MONTHS
  */

  const months =
    await db

      .select()

      .from(
        financialMonths
      )

      .where(
        eq(
          financialMonths.userId,
          userId
        )
      )

      .orderBy(
        desc(
          financialMonths.referenceMonth
        )
      )

      .limit(6);

  /*
  PARSE VALUES
  */

  const projectedIncome =
    Number(
      currentFinancialMonth
        ?.projectedIncome
      ?? 0
    );

  const projectedExpense =
    Number(
      currentFinancialMonth
        ?.projectedExpense
      ?? 0
    );

  const projectedBalance =
    Number(
      currentFinancialMonth
        ?.projectedBalance
      ?? 0
    );

  const committedAmount =
    Number(
      currentFinancialMonth
        ?.committedAmount
      ?? 0
    );

  /*
  PERCENTAGE
  */

  const commitmentPercentage =
    projectedIncome > 0

      ? (
          projectedExpense
          /
          projectedIncome
        ) * 100

      : 0;

  /*
  CHART DATA
  */

  const recentMonths =
    months

      .reverse()

      .map(
        (month) => ({

          referenceMonth:
            month.referenceMonth,

          projectedBalance:
            Number(
              month.projectedBalance
              ?? 0
            ),
        })
      );

  /*
  EXPENSES BY CATEGORY
  */

  const expensesByCategory =
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

      .from(
        transactions
      )

      .leftJoin(

        categories,

        eq(
          categories.id,
          transactions.categoryId
        )
      )

      .leftJoin(

        financialMonths,

        eq(
          financialMonths.id,
          transactions.financialMonthId
        )
      )

      .where(
        and(

          eq(
            transactions.userId,
            userId
          ),

          eq(
            transactions.transactionType,
            'EXPENSE'
          ),

          eq(
            financialMonths.referenceMonth,
            currentMonth.referenceMonth
          )
        )
      )

      .groupBy(
        categories.name
      );

  /*
  CASH FLOW
  */

  const monthlyCashFlow =
    await Promise.all(

      recentMonths.map(
        async (
          month
        ) => {

          const projected =
            await getProjectedTransactions(

              userId,

              month.referenceMonth
                .slice(0, 7)
            );

          const projectedTotal =
            projected.reduce(

              (
                acc,
                item
              ) => {

                return (
                  acc
                  + item.projectedTotal
                );
              },

              0
            );

          return {

            referenceMonth:
              month.referenceMonth,

            realized:
              Number(
                month.projectedBalance
              ),

            projected:
              projectedTotal,
          };
        }
      )
    );

  /*
  WEEKLY EXPENSES
  */

  const pendingPage =
    options?.pendingPage
    ?? 1;

  const pendingPageSize =
    options?.pendingPageSize
    ?? 3;

  const weeklyExpensesResult =
    await db

      .select({

        id:
          recurringTransactions.id,

        description:
          recurringTransactions.description,

        amount:
          recurringTransactions.projectedAmount,

        effectiveDate:
          recurringTransactions.dueDate,

        paymentMethodName:
          paymentMethods.name,

        paymentMethodId:
          recurringTransactions.paymentMethodId,

        recurringTransactionId:
          recurringTransactions.id,

        referenceMonth:
          financialMonths.referenceMonth,
      })

      .from(
        recurringTransactions
      )

      .innerJoin(

        financialMonths,

        eq(
          recurringTransactions.financialMonthId,
          financialMonths.id
        )
      )

      .leftJoin(

        paymentMethods,

        eq(
          paymentMethods.id,
          recurringTransactions.paymentMethodId
        )
      )

      .where(
        and(

          eq(
            financialMonths.userId,
            userId
          ),

          lte(
            financialMonths.referenceMonth,
            currentMonth.referenceMonth
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

      .orderBy(
        asc(
          recurringTransactions.dueDate
        )
      )

      .limit(
        pendingPageSize + 1
      )

      .offset(
        (pendingPage - 1)
        * pendingPageSize
      );

  const today =
    new Date()
      .toISOString()
      .split('T')[0];

  const [pendingSummary] =
    await db

      .select({

        pendingAmount:
          sql<string>`
            coalesce(
              sum(
                ${recurringTransactions.projectedAmount}
              ),
              0
            )
          `,

        pendingCount:
          sql<string>`
            count(*)
          `,

        overdueAmount:
          sql<string>`
            coalesce(
              sum(
                case
                  when ${recurringTransactions.dueDate} < ${today}
                  then ${recurringTransactions.projectedAmount}
                  else 0
                end
              ),
              0
            )
          `,

        overdueCount:
          sql<string>`
            count(
              case
                when ${recurringTransactions.dueDate} < ${today}
                then 1
              end
            )
          `,
      })

      .from(recurringTransactions)

      .innerJoin(

        financialMonths,

        eq(
          recurringTransactions.financialMonthId,
          financialMonths.id
        )
      )

      .where(
        and(

          eq(
            financialMonths.userId,
            userId
          ),

          lte(
            financialMonths.referenceMonth,
            currentMonth.referenceMonth
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
      );

  const [paidThisMonthResult] =
    await db

      .select({

        total:
          sql<string>`
            coalesce(
              sum(
                ${transactions.amount}
              ),
              0
            )
          `,
      })

      .from(transactions)

      .leftJoin(

        financialMonths,

        eq(
          transactions.financialMonthId,
          financialMonths.id
        )
      )

      .where(
        and(

          eq(
            transactions.userId,
            userId
          ),

          eq(
            transactions.transactionType,
            'EXPENSE'
          ),

          eq(
            transactions.status,
            'CONFIRMED'
          ),

          eq(
            financialMonths.referenceMonth,
            currentMonth.referenceMonth
          )
        )
      );

  const userPaymentMethods =
    await db

      .select({

        id:
          paymentMethods.id,

        name:
          paymentMethods.name,
      })

      .from(paymentMethods)

      .where(
        and(

          eq(
            paymentMethods.userId,
            userId
          ),

          eq(
            paymentMethods.isActive,
            true
          )
        )
      )

      .orderBy(
        asc(
          paymentMethods.name
        )
      );

  /*
  RECENT TRANSACTIONS
  */

  const recentTransactions =
    await db

      .select({

        id:
          transactions.id,

        description:
          transactions.description,

        amount:
          transactions.amount,

        transactionType:
          transactions.transactionType,

        createdAt:
          transactions.createdAt,
      })

      .from(
        transactions
      )

      .where(
        eq(
          transactions.userId,
          userId
        )
      )

      .orderBy(
        desc(
          transactions.createdAt
        )
      )

      .limit(7);

  return {

    currentMonth,

    projectedIncome,

    projectedExpense,

    projectedBalance,

    committedAmount,

    commitmentPercentage,

    monthlyBalance:
      projectedBalance,

    recentMonths,

    monthlyCashFlow,

    operationalSummary: {

      pendingAmount:
        Number(
          pendingSummary
            ?.pendingAmount
          ?? 0
        ),

      pendingCount:
        Number(
          pendingSummary
            ?.pendingCount
          ?? 0
        ),

      overdueAmount:
        Number(
          pendingSummary
            ?.overdueAmount
          ?? 0
        ),

      overdueCount:
        Number(
          pendingSummary
            ?.overdueCount
          ?? 0
        ),

      paidThisMonth:
        Number(
          paidThisMonthResult
            ?.total
          ?? 0
        ),

      expectedThisMonth:
        projectedExpense,
    },

    expensesByCategory:
      expensesByCategory.map(
        (item) => ({

          category:
            item.category,

          total:
            Number(
              item.total
            ),
        })
      ),

    weeklyExpenses:
      weeklyExpensesResult
        .slice(0, pendingPageSize)
        .map(
          (item) => ({

            ...item,

            amount:
              Number(
                item.amount
              ),
          })
        ),

    hasMorePending:
      weeklyExpensesResult.length
      > pendingPageSize,

    pendingPage,

    paymentMethods:
      userPaymentMethods,

    recentTransactions:
      recentTransactions.map(
        (item) => ({

          ...item,

          amount:
            Number(
              item.amount
            ),
        })
      ),
  };
}
