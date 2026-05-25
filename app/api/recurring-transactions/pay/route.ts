import {
  auth,
} from '@clerk/nextjs/server';

import {
  NextResponse,
} from 'next/server';

import {
  payRecurringTransaction,
} from '../../../../services/pay-recurring-transaction-service';

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

  const body =
    await request.json();

  await payRecurringTransaction({

    userId:
      session.userId,

    recurringTransactionId:
      body.recurringTransactionId,
  });

  return NextResponse.json({
    success: true,
  });
}