import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

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

  await recalculateFinancialMonth(
    current.financialMonthId
  );

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
