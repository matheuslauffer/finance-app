import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  eq,
} from 'drizzle-orm';

type UpdateTransactionInput =
{
  id: string;

  description: string;

  amount: string;
};

export async function
updateTransaction(
  input:
    UpdateTransactionInput
) {

  await db
    .update(transactions)
    .set({

      description:
        input.description,

      amount:
        input.amount,
    })

    .where(
      eq(
        transactions.id,
        input.id
      )
    );
}