import {
  auth,
} from '@clerk/nextjs/server';

import {
  NextResponse,
} from 'next/server';

import { db } from '@/db';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import type {
  PaymentMethodType,
} from '../../../db/schema/enums';

export async function
POST(
  request: Request
) {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

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

  await db

  .insert(
    paymentMethods
  )

  .values({

    userId,

    name:
      formData.get(
        'name'
      ) as string,

    methodType:
      formData.get(
        'type'
      ) as PaymentMethodType,

    supportsInstallments:
      formData.get(
        'supportsInstallments'
      ) === 'on',

    closingDay:

  formData.get(
    'closingDay'
  )

    ? Number(
        formData.get(
          'closingDay'
        )
      )

    : null,

dueDay:

  formData.get(
    'dueDay'
  )

    ? Number(
        formData.get(
          'dueDay'
        )
      )

    : null,
  });

  return NextResponse.redirect(

    new URL(
      '/payment-methods',
      request.url
    )
  );
}