import {
  auth,
} from '@clerk/nextjs/server';

import {
  ImportPayload,
} from '@/types/import-payload';

import {
  importTransactions,
} from '@/services/import-service';

export async function POST(
  request: Request
) {

  const { userId } =
    await auth();

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

  const body:
  ImportPayload[] =
    await request.json();

  await importTransactions(userId, body);

  return Response.json({
    success: true,
  });
}