import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  eq,
} from 'drizzle-orm';

type UpdateRecurringTransactionInput = {

  recurringTransactionId:
    string;

  description:
    string;

  amount:
    string;

  transactionType:
    | 'INCOME'
    | 'EXPENSE';

  frequency:
    | 'DAILY'
    | 'WEEKLY'
    | 'BIWEEKLY'
    | 'MONTHLY'
    | 'YEARLY';

  categoryId:
    string;

  paymentMethodId:
    string;

  effectiveFrom:
    string;

  effectiveUntil?:
    string;
};

export async function
updateRecurringTransaction(

  input:
    UpdateRecurringTransactionInput
) {

  /*
  LOAD CURRENT VERSION
  */

  const [current] =
    await db

      .select()

      .from(
        recurringTransactions
      )

      .where(
        eq(
          recurringTransactions.id,

          input
            .recurringTransactionId
        )
      );

  if (!current) {

    throw new Error(
      'Recurring transaction not found.'
    );
  }

  /*
  END CURRENT VERSION
  */

  await db

    .update(
      recurringTransactions
    )

    .set({

      status:
        'ENDED',

      effectiveUntil:
        input
          .effectiveFrom,
    })

    .where(
      eq(
        recurringTransactions.id,

        current.id
      )
    );

  /*
  CREATE NEW VERSION
  */

  const [created] =
    await db

      .insert(
        recurringTransactions
      )

      .values({

        userId:
          current.userId,

        description:
          input.description,

        amount:
          input.amount,

        transactionType:
          input.transactionType,

        frequency:
          input.frequency,

        status:
          'ACTIVE',

        effectiveFrom:
          input.effectiveFrom,

        effectiveUntil:
          input.effectiveUntil,

        categoryId:
          input.categoryId,

        paymentMethodId:
          input.paymentMethodId,

        parentRecurringTransactionId:
          current.id,
      })

      .returning();

  return created;
}