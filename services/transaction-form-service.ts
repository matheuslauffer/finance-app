import { db } from '@/db';

import {
  categories,
} from '@/db/schema/categories';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  eq,
  and,
} from 'drizzle-orm';

export async function
getTransactionFormData(
  userId: string
) {

  const [
    categoriesResult,

    paymentMethodsResult,
  ] = await Promise.all([

    db
      .select()
      .from(categories)
      .where(
        eq(
          categories.userId,
          userId
        )
      ),

    db
      .select()
      .from(paymentMethods)
      .where(

        and(

          eq(
            paymentMethods.userId,
            userId
          ),

          eq(
            paymentMethods.isActive,
            true
          )
        )
      ),
  ]);

  return {

    categories:
      categoriesResult,

    paymentMethods:
      paymentMethodsResult,
  };
}