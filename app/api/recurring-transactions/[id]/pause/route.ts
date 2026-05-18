import {
  auth,
} from '@clerk/nextjs/server';

import {
  NextResponse,
} from 'next/server';

import {
  pauseRecurringTransaction,
} from '@/services/pause-recurring-transaction-service';

type Props = {

  params: {
    id: string;
  };
};

export async function
POST(
  request: Request,

  {
    params,
  }: Props
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

  await pauseRecurringTransaction(
    params.id
  );

  return NextResponse.redirect(

    new URL(
      '/recurring-transactions',

      request.url
    )
  );
}