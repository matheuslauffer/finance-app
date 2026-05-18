import {
  auth,
} from '@clerk/nextjs/server';

import {
  getCurrentMonth,
} from '@/lib/current-month';

import {
  generateRecurringTransactions,
} from '@/services/generate-recurring-transactions-service';

function
normalizeMonth(
  month?: string
) {

  if (
    month
    && /^\d{4}-\d{2}$/.test(
      month
    )
  ) {

    return month;
  }

  return getCurrentMonth()
    .slice(
      0,
      7
    );
}

export async function
POST(
  request: Request
) {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    return Response.json(
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
    await request
      .json()
      .catch(
        () => ({})
      );

  const month =
    normalizeMonth(
      body.month
    );

  const result =
    await generateRecurringTransactions(
      userId,
      month
    );

  return Response.json(
    result
  );
}
