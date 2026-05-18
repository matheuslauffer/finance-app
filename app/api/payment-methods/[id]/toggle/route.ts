import {
  NextResponse,
} from 'next/server';

import { db } from '@/db';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  eq,
} from 'drizzle-orm';

type Props = {

  params: Promise<{
    id: string;
  }>;
};

export async function
POST(
  request: Request,
  { params }: Props
) {

  const { id } =
    await params;

  const [method] =
    await db

      .select()

      .from(
        paymentMethods
      )

      .where(
        eq(
          paymentMethods.id,
          id
        )
      );

  if (!method) {

    return NextResponse.json(

      {
        error:
          'Not found',
      },

      {
        status: 404,
      }
    );
  }

  await db

    .update(
      paymentMethods
    )

    .set({

      isActive:
        !method.isActive,
    })

    .where(
      eq(
        paymentMethods.id,
        id
      )
    );

  return NextResponse.redirect(

    new URL(
      '/payment-methods',
      request.url
    )
  );
}