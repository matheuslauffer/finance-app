import { db } from '@/db';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  generateRecurringTransactions,
} from './generate-recurring-transactions-service';

type Input = {

  userId: string;

  categoryId: string;

  paymentMethodId: string;

  description: string;

  amount: string;

  frequency:
    | 'DAILY'
    | 'WEEKLY'
    | 'BIWEEKLY'
    | 'MONTHLY'
    | 'YEARLY';

  transactionType:
    | 'INCOME'
    | 'EXPENSE';

  nextOccurrence: string;
};

export async function
createRecurrence(
  input: Input
) {

  const [recurrence] =
    await db

      .insert(recurrences)

      .values({

        userId:
          input.userId,

        categoryId:
          input.categoryId,

        paymentMethodId:
          input.paymentMethodId,

        description:
          input.description,

        amount:
          input.amount,

        frequency:
          input.frequency,

        transactionType:
          input.transactionType,

        nextOccurrence:
          input.nextOccurrence,

        isActive:
          true,
      })

      .returning();

  await generateRecurringTransactions(
    recurrence.id
  );

  return recurrence;
}