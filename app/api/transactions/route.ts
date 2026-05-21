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

  const isRecurring =
    formData.get(
      'isRecurring'
    ) === 'on';

  /*
  DATES
  */

  const effectiveDate =
    formData.get(
      'effectiveDate'
    ) as string;

  const dueDate =
    (
      formData.get(
        'dueDate'
      ) as string | null
    )
    ?? effectiveDate;

  /*
  INSTALLMENTS
  */

  const installmentCount =

    formData.get(
      'installmentCount'
    ) === 'custom'

      ? Number(

          formData.get(
            'customInstallmentCount'
          )
        )

      : Number(

          formData.get(
            'installmentCount'
          ) ?? 1
        );

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

        effectiveDate,

        dueDate,
      });

    return Response.json(
      updated
    );
  }

  /*
  RECURRING
  */

  if (
    isRecurring
  ) {

    return Response.redirect(
      new URL(
        '/transactions/new',
        request.url
      )
    );
  }

  /*
  CREATE
  */

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
      installmentCount > 1

        ? 'INSTALLMENT_PURCHASE'

        : 'PURCHASE',

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
        effectiveDate
      ),

    effectiveDate,

    dueDate,

    installmentCount,
  });

  return Response.redirect(
    new URL(
      '/transactions/new',
      request.url
    )
  );
}