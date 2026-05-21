import {
  auth,
} from '@clerk/nextjs/server';

import {
  NextResponse,
} from 'next/server';

import { db } from '@/db';

import {
  updateRecurringTransaction,
} from '@/services/update-recurring-transaction-service';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  generateRecurringTransactions,
} from '@/services/generate-recurring-transactions-service';

export async function
POST(
  request: Request
) {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    return NextResponse
      .json(
        {
          error:
            'Unauthorized',
        },

        {
          status: 401,
        }
      );
  }

  const formData =
    await request.formData();

  const recurringTransactionId =
    formData.get(
      'recurringTransactionId'
    ) as string | null;

  const payload = {

    description:
      formData.get(
        'description'
      ) as string,

    amount:
      formData.get(
        'amount'
      ) as string,

    transactionType:
      formData.get(
        'transactionType'
      ) as
        | 'INCOME'
        | 'EXPENSE',

    frequency:
      formData.get(
        'frequency'
      ) as
        | 'DAILY'
        | 'WEEKLY'
        | 'BIWEEKLY'
        | 'MONTHLY'
        | 'YEARLY',

    categoryId:
    (
      formData.get(
        'subcategoryId'
      )

      ||

      formData.get(
        'categoryId'
      )
    ) as string,

    paymentMethodId:
      formData.get(
        'paymentMethodId'
      ) as string,

    effectiveFrom:
      formData.get(
        'effectiveFrom'
      ) as string,

    effectiveUntil:
      formData.get(
        'effectiveUntil'
      ) as string,
  };

  /*
  UPDATE / VERSION
  */

  if (
    recurringTransactionId
  ) {

    await updateRecurringTransaction({

      recurringTransactionId,

      ...payload,
    });

    return NextResponse.redirect(

      new URL(
        '/recurring-transactions',

        request.url
      )
    );
  }

  /*
  CREATE
  */

  const [recurrence] =
    await db

      .insert(
        recurrences
      )

      .values({

        userId,

        categoryId:
          payload.categoryId,

        paymentMethodId:
          payload.paymentMethodId,

        description:
          payload.description,

        amount:
          payload.amount,

        frequency:
          payload.frequency,

        nextOccurrence:
          payload.effectiveFrom,

        isActive:
          true,

        transactionType:
          formData.get(
            'transactionType'
          ) as
            | 'INCOME'
            | 'EXPENSE',
      })

      .returning();

  /*
  GENERATE SNAPSHOTS
  */

  await generateRecurringTransactions(
    recurrence.id
  );

  return NextResponse.redirect(

    new URL(
      '/recurring-transactions',

      request.url
    )
  );
}