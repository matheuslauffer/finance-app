import { db } from '@/db';

import { transactions } from '@/db/schema/transactions';

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

export async function createTransaction(
  input: CreateTransactionInput
) {
  const result = await db
    .insert(transactions)
    .values({
      userId: input.userId,

      paymentMethodId:
        input.paymentMethodId,

      categoryId: input.categoryId,

      financialMonthId:
        input.financialMonthId,

      description: input.description,

      amount: input.amount,

      transactionType:
        input.transactionType,

      status: input.status,

      occurredAt: input.occurredAt,

      effectiveDate:
        input.effectiveDate,
    })
    .returning();

  return result[0];
}