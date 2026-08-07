import {
  auth,
} from '@clerk/nextjs/server';

import {
  NextResponse,
} from 'next/server';

import {
  cancelRecurringTransaction,
} from '@/services/cancel-recurring-transaction-service';

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

  const { id } = await params;
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

  await cancelRecurringTransaction(
    id
  );

  return NextResponse.redirect(

    new URL(
      request.headers.get('referer') ?? '/dashboard',

      request.url
    )
  );
}
