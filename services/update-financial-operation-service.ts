import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  eq,
} from 'drizzle-orm';

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
      })

      .where(
        eq(
          transactions.id,

          transactionId
        )
      )

      .returning();

  return updated;
}