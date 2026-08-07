import {
  auth,
} from '@clerk/nextjs/server';

import {
  NextResponse,
} from 'next/server';

import {
  updateRecurringOccurrence,
} from '@/services/update-recurring-occurrence-service';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function
POST(
  request: Request,

  {
    params,
  }: Props
) {

  const { id } =
    await params;

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

  const paymentMethodId =
    String(
      formData.get(
        'paymentMethodId'
      )
    );

  const projectedAmount =
    String(
      formData.get(
        'projectedAmount'
      )
    );

  const dueDate =
    String(
      formData.get(
        'dueDate'
      )
    );

  if (
    !paymentMethodId
    ||
    !projectedAmount
    ||
    !dueDate
    ||
    Number(projectedAmount) <= 0
  ) {

    return NextResponse.json(

      {
        error:
          'Invalid recurring occurrence data',
      },

      {
        status: 400,
      }
    );
  }

  await updateRecurringOccurrence({

    userId:
      session.userId,

    recurringTransactionId:
      id,

    paymentMethodId,

    projectedAmount,

    dueDate,
  });

  return Response.redirect(

    request.headers.get('referer')
    ?? '/dashboard',

    303
  );
}
