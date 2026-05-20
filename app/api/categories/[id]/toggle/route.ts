import {
  auth,
} from '@clerk/nextjs/server';

import { db } from '@/db';

import {
  categories,
} from '@/db/schema/categories';

import {
  and,
  eq,
  or,
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

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    return Response.json(
      {
        error:
          'Unauthorized',
      },

      {
        status: 401,
      }
    );
  }

  const { id } =
    await params;

  const [category] =
    await db
      .select()
      .from(
        categories
      )
      .where(
        and(

          eq(
            categories.id,
            id
          ),

          eq(
            categories.userId,
            userId
          )
        )
      );

  if (!category) {

    return Response.json(
      {
        error:
          'Category not found',
      },

      {
        status: 404,
      }
    );
  }

  const nextIsActive =
    !category.isActive;

  await db
    .update(
      categories
    )
    .set({

      isActive:
        nextIsActive,
    })
    .where(
      category.parentCategoryId
        ? and(

            eq(
              categories.id,
              id
            ),

            eq(
              categories.userId,
              userId
            )
          )
        : and(

            eq(
              categories.userId,
              userId
            ),

            or(

              eq(
                categories.id,
                id
              ),

              eq(
                categories
                  .parentCategoryId,
                id
              )
            )
          )
    );

  return Response.redirect(
    new URL(
      '/categories',
      request.url
    )
  );
}
