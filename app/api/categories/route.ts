import { db } from '@/db';

import {
  categories,
} from '@/db/schema/categories';

export async function GET() {

  const result =
    await db
      .select()
      .from(categories);

  return Response.json(result);
}