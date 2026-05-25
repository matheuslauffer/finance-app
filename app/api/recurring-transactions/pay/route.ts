import {
  auth,
} from '@clerk/nextjs/server';

import {
  NextResponse,
} from 'next/server';

import {
  payRecurringTransaction,
} from '@/services/pay-recurring-transaction-service';

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

  /*
  FORM DATA
  */

  const formData =
    await request.formData();

  const recurringTransactionId =
    String(
      formData.get(
        'recurringTransactionId'
      )
    );

  /*
  VALIDATION
  */

  if (
    !recurringTransactionId
    ||
    recurringTransactionId === 'null'
    ||
    recurringTransactionId === 'undefined'
  ) {

    return NextResponse.json(

      {
        error:
          'Recurring transaction id is required',
      },

      {
        status: 400,
      }
    );
  }

  /*
  PAY
  */

  await payRecurringTransaction({

    userId:
      session.userId,

    recurringTransactionId,
  });

  /*
  REDIRECT BACK
  */

  return Response.redirect(

    request.headers.get('referer')
    ?? '/projections',

    303
  );
}