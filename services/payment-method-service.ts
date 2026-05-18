import { db } from '@/db';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  eq,
  asc,
} from 'drizzle-orm';

export async function
getPaymentMethods(
  userId: string
) {

  return await db

    .select()

    .from(
      paymentMethods
    )

    .where(
      eq(
        paymentMethods.userId,
        userId
      )
    )

    .orderBy(
      asc(
        paymentMethods.name
      )
    );
}