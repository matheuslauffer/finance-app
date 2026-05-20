import { db } from '@/db';

import {
  categories,
} from '@/db/schema/categories';

import {
  asc,
  eq,
} from 'drizzle-orm';

export async function
getCategories(
  userId: string
) {

  return await db
    .select()
    .from(
      categories
    )
    .where(
      eq(
        categories.userId,
        userId
      )
    )
    .orderBy(
      asc(
        categories.name
      )
    );
}
