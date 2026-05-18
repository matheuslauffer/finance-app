import {
  createFinancialOperation,
} from '@/services/financial-operation-service';

import {
  updateFinancialOperation,
} from '@/services/update-financial-operation-service';

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

  const formData =
    await request.formData();

  const transactionId =
    formData.get(
      'transactionId'
    ) as string | null;

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
          formData.get(
            'paymentMethodId'
          ) as string,

        categoryId:
          formData.get(
            'categoryId'
          ) as string,

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

        effectiveDate:
          formData.get(
            'effectiveDate'
          ) as string,
      });

    return Response.json(
      updated
    );
  }

  /*
  CREATE
  */

  const result =
    await createFinancialOperation({

      userId,

      paymentMethodId:
        formData.get(
          'paymentMethodId'
        ) as string,

      categoryId:
        formData.get(
          'categoryId'
        ) as string,

      description:
        formData.get(
          'description'
        ) as string,

      amount:
        formData.get(
          'amount'
        ) as string,

      operationType:
        'PURCHASE',

      transactionType:
        formData.get(
          'transactionType'
        ) as
          | 'INCOME'
          | 'EXPENSE',

      status:
        'CONFIRMED',

      occurredAt:
        new Date(
          formData.get(
            'effectiveDate'
          ) as string
        ),

      effectiveDate:
        formData.get(
          'effectiveDate'
        ) as string,

      installmentCount:
        1,
    });

  return Response.redirect(
    new URL(
      '/transactions/new',
      request.url
    )
  );
}