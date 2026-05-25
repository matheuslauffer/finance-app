import {
  auth,
} from '@clerk/nextjs/server';

import {
  NextResponse,
} from 'next/server';

import {
  createRecurrence,
} from '@/services/create-recurrence-service';

import {
  updateRecurringTransaction,
} from '@/services/update-recurring-transaction-service';

export async function
POST(
  request: Request
) {

  const session =
    await auth();

  if (!session.userId) {

    return NextResponse.json(

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
      formData.get(
        'categoryId'
      ) as string,

    paymentMethodId:
      formData.get(
        'paymentMethodId'
      ) as string,

    nextOccurrence:
      formData.get(
        'effectiveFrom'
      ) as string,

    endedAt:
      formData.get(
        'effectiveUntil'
      )?.toString().trim() || null,
  };

  /*
  UPDATE
  */

  if (
    recurringTransactionId
  ) {

    await updateRecurringTransaction({

      recurrenceId:
        recurringTransactionId,

      userId:
        session.userId,

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

  await createRecurrence({

    userId:
      session.userId,

    ...payload,
  });

  return NextResponse.redirect(

    new URL(
      '/recurring-transactions',
      request.url
    )
  );
}