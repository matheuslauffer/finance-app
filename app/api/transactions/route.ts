import {
  createFinancialOperation,
} from '@/services/financial-operation-service';

import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  desc,
} from 'drizzle-orm';

import {
  auth,
} from '@clerk/nextjs/server';

export async function GET() {

  const result =
    await db
      .select()
      .from(transactions)
      .orderBy(
        desc(
          transactions.createdAt
        )
      );

  return Response.json(result);
}

export async function POST(
  request: Request
) {
  const { userId } = await auth();

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

  const body = await request.json();

  const result =
    await createFinancialOperation({
      userId: userId,

      paymentMethodId:
        body.paymentMethodId,

      categoryId:
        body.categoryId,

      description:
        body.description,

      amount:
        body.amount,

      operationType:
        body.operationType,

      transactionType:
        body.transactionType,

      status:
        body.status,

      occurredAt:
        new Date(body.occurredAt),

      effectiveDate:
        body.effectiveDate,

      installmentCount:
        body.installmentCount,
    });

  return Response.json(result);
}