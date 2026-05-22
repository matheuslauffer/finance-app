import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  eq,
} from 'drizzle-orm';

import {
  resolveFinancialMonth,
} from './financial-month-service';

import {
  recalculateFinancialMonth,
} from './recalculate-financial-month';

type Input = {

  transactionId:
    string;

  paymentMethodId:
    string;

  categoryId:
    string;

  description:
    string;

  amount:
    string;

  transactionType:
    | 'INCOME'
    | 'EXPENSE';

  effectiveDate:
    string;

  dueDate:
    string;
};

export async function
updateFinancialOperation({
  transactionId,
  paymentMethodId,
  categoryId,
  description,
  amount,
  transactionType,
  effectiveDate,
}: Input) {

  /*
  CURRENT TRANSACTION
  */

  const [current] =
    await db

      .select()

      .from(
        transactions
      )

      .where(
        eq(
          transactions.id,

          transactionId
        )
      );

  if (!current) {

    throw new Error(
      'Transaction not found.'
    );
  }

  /*
  CURRENT FINANCIAL MONTH
  */

  const [currentFinancialMonth] =
    await db

      .select()

      .from(financialMonths)

      .where(
        eq(
          financialMonths.id,
          current.financialMonthId
        )
      );

  /*
  BLOCK CLOSED MONTH
  */

  if (
    currentFinancialMonth
    ?.status
    === 'CLOSED'
  ) {

    throw new Error(
      'Financial month is closed'
    );
  }

  /*
  NEW MONTH
  */

  const occurredAt =
    new Date(
      effectiveDate
    );

  const financialMonth =
    await resolveFinancialMonth(

      current.userId,

      paymentMethodId,

      occurredAt
    );

  /*
  UPDATE TRANSACTION
  */

  const [updated] =
    await db

      .update(
        transactions
      )

      .set({

        paymentMethodId,

        categoryId,

        description,

        amount,

        transactionType,

        effectiveDate,

        financialMonthId:
          financialMonth.id,

        occurredAt,
      })

      .where(
        eq(
          transactions.id,

          transactionId
        )
      )

      .returning();

  /*
  RECALCULATE OLD MONTH
  */

  await recalculateFinancialMonth(
    current.financialMonthId
  );

  /*
  RECALCULATE NEW MONTH
  */

  if (
    current.financialMonthId
    !== financialMonth.id
  ) {

    await recalculateFinancialMonth(
      financialMonth.id
    );
  }

  return updated;
}