import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  desc,
  eq,
  and,
  ilike,
} from 'drizzle-orm';

type CreateTransactionInput = {

  userId: string;

  paymentMethodId: string;

  categoryId: string;

  financialMonthId: string;

  description: string;

  amount: string;

  transactionType:
    | 'INCOME'
    | 'EXPENSE';

  status:
    | 'PROJECTED'
    | 'CONFIRMED';

  occurredAt: Date;

  effectiveDate: string;
};

type GetTransactionsInput = {

  userId: string;

  search?: string;

  transactionType?:
    | 'INCOME'
    | 'EXPENSE';
};

export async function
createTransaction(
  input: CreateTransactionInput
) {

  const result =
    await db
      .insert(transactions)
      .values({

        userId:
          input.userId,

        paymentMethodId:
          input.paymentMethodId,

        categoryId:
          input.categoryId,

        financialMonthId:
          input.financialMonthId,

        description:
          input.description,

        amount:
          input.amount,

        transactionType:
          input.transactionType,

        status:
          input.status,

        occurredAt:
          input.occurredAt,

        effectiveDate:
          input.effectiveDate,
      })
      .returning();

  return result[0];
}

export async function
getTransactions({
  userId,
  search,
  transactionType,
}: GetTransactionsInput)
{

  const filters = [

    eq(
      transactions.userId,
      userId
    ),
  ];

  /*
  SEARCH
  */

  if (search) {

    filters.push(

      ilike(
        transactions.description,
        `%${search}%`
      )
    );
  }

  /*
  TYPE
  */

  if (transactionType) {

    filters.push(

      eq(
        transactions.transactionType,
        transactionType
      )
    );
  }

  const result =
    await db
      .select()
      .from(transactions)

      .where(
        and(
          ...filters
        )
      )

      .orderBy(
        desc(
          transactions.createdAt
        )
      );

  return result;
}