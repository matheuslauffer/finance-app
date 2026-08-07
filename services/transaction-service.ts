import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  desc,
  eq,
  and,
  ilike,
  sql,
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
  paymentMethodId?: string;

  limit?: number;

  cursor?: string;
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
  paymentMethodId,
  limit = 20,
  cursor,
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

  if (paymentMethodId) {
    filters.push(
      eq(
        transactions.paymentMethodId,
        paymentMethodId
      )
    );
  }

  /*
  CURSOR
  */

  if (cursor) {
    const [
      createdAtDate,
      cursorId,
    ] = cursor.split('|');

    // Use ISO string for the timestamp comparison to ensure the DB receives
    // a properly formatted timestamp parameter (avoid Date.toString()).
    const createdAtIso = new Date(createdAtDate).toISOString();

    filters.push(
      sql`(
        ${transactions.createdAt},
        ${transactions.id}
      ) < (
        ${createdAtIso}::timestamp,
        ${cursorId}::uuid
      )`
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
        ),
        desc(
          transactions.id
        )
      )

      .limit(limit + 1);

  return result;
}
