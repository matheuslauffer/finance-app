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

import {
  updateFinancialOperation,
} from '@/services/update-financial-operation-service';


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

  const body =
  await request.json();

  const transactionId =
  body.transactionId;

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

/*
UPDATE
*/

if (
  transactionId
) {

  const updated =
    await updateFinancialOperation({

      transactionId,

      paymentMethodId:
        body.paymentMethodId,

      categoryId:
        body.categoryId,

      description:
        body.description,

      amount:
        body.amount,

      transactionType:
        body.transactionType,

      effectiveDate:
        body.effectiveDate,
    });

  return Response.json(
    updated
  );
}

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