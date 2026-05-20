import { db } from '@/db';

import {
  categories,
} from '@/db/schema/categories';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  and,
  asc,
  eq,
} from 'drizzle-orm';

export async function
getRecurringTransactionFormData(
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
        and(

          eq(
            categories.userId,
            userId
          ),

          eq(
            categories.isActive,
            true
          )
        )
      )
      .orderBy(
        asc(
          categories.name
        )
      ),

    db
      .select()
      .from(paymentMethods)
      .where(
        eq(
          paymentMethods.userId,
          userId
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
