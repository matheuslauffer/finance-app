import { db } from '@/db';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  transactions,
} from '@/db/schema/transactions';

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
  userId: string
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

  const today =
    new Date();

  const nextWeek =
    new Date();

  nextWeek.setDate(
    today.getDate() + 7
  );

  const weeklyExpenses =
    await db

      .select({

        id:
          transactions.id,

        description:
          transactions.description,

        amount:
          transactions.amount,

        effectiveDate:
          transactions.effectiveDate,

        paymentMethodName:
          paymentMethods.name,
      })

      .from(
        transactions
      )

      .leftJoin(

        paymentMethods,

        eq(
          paymentMethods.id,
          transactions.paymentMethodId
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

          sql`
            ${transactions.effectiveDate}
            BETWEEN
            ${today.toISOString().split('T')[0]}
            AND
            ${nextWeek.toISOString().split('T')[0]}
          `
        )
      )

      .orderBy(
        transactions.effectiveDate
      )

      .limit(10);

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

      .limit(5);

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
      weeklyExpenses.map(
        (item) => ({

          ...item,

          amount:
            Number(
              item.amount
            ),
        })
      ),

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