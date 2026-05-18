import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  categories,
} from '@/db/schema/categories';

import {
  eq,
  sum,
  desc,
} from 'drizzle-orm';

export async function
getCategorySummary(
  userId: string
) {

  return await db
    .select({
      category:
        categories.name,

      total:
        sum(
          transactions.amount
        ),
    })

    .from(transactions)

    .innerJoin(
      categories,

      eq(
        categories.id,
        transactions.categoryId
      )
    )

    .where(
      eq(
        transactions.userId,
        userId
      )
    )

    .groupBy(
      categories.name
    )

    .orderBy(
      desc(
        sum(
          transactions.amount
        )
      )
    );
}