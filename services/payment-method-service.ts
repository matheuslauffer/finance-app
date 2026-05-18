import { db } from '@/db';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  eq,
  asc,
  desc
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

        desc(
            paymentMethods.isActive
        ),

      asc(
        paymentMethods.name
      )
    );
}