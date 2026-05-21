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
  asc,
  isNull,
  isNotNull,
} from 'drizzle-orm';

export async function
getTransactionFormData(
  userId: string
) {

  const [

    mainCategoriesResult,

    subcategoriesResult,

    paymentMethodsResult,

  ] = await Promise.all([

    /*
    MAIN CATEGORIES
    */

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
          ),

          isNull(
            categories.parentCategoryId
          )
        )
      )
      .orderBy(
        asc(
          categories.name
        )
      ),

    /*
    SUBCATEGORIES
    */

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
          ),

          isNotNull(
            categories.parentCategoryId
          )
        )
      )
      .orderBy(
        asc(
          categories.name
        )
      ),

    /*
    PAYMENT METHODS
    */

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

    mainCategories:
      mainCategoriesResult,

    subcategories:
      subcategoriesResult,

    paymentMethods:
      paymentMethodsResult,
  };
}