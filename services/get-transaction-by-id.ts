import { db } from '@/db';

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
  eq,
} from 'drizzle-orm';

export async function
getTransactionById(
  transactionId: string
) {

  const [transaction] =
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

        status:
          transactions.status,

        effectiveDate:
          transactions.effectiveDate,

        createdAt:
          transactions.createdAt,

        categoryName:
          categories.name,

        paymentMethodName:
          paymentMethods.name,
      })

      .from(transactions)

      .leftJoin(
        categories,
        eq(
          categories.id,
          transactions.categoryId
        )
      )

      .leftJoin(
        paymentMethods,
        eq(
          paymentMethods.id,
          transactions.paymentMethodId
        )
      )

      .where(
        eq(
          transactions.id,
          transactionId
        )
      );

  return transaction;
}