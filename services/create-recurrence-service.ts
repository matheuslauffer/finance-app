import { db } from '@/db';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  ensureFinancialProjectionCoverage,
} from '@/services/ensure-financial-projection-coverage-service';

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

  dueDay: number;

  weekDay:
    number | null;
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

        dueDay:
          input.dueDay,

        weekDay:
          input.weekDay,

        isActive:
          true,
      })

      .returning();

      await ensureFinancialProjectionCoverage({

        userId: input.userId,

        untilReferenceMonth:
            '2028-12',
        });

  return recurrence;
}
