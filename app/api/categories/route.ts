import { db } from '@/db';

import {
  categories,
} from '@/db/schema/categories';

import {
  auth,
} from '@clerk/nextjs/server';

import {
  and,
  eq,
  ilike,
  isNull,
} from 'drizzle-orm';

export async function GET() {

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

  const result =
    await db
      .select()
      .from(categories)
      .where(
        eq(
          categories.userId,
          userId
        )
      );

  return Response.json(result);
}

export async function POST(
  request: Request
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

  const body =
    await request.json();

  const name =
    String(
      body.name
      ?? ''
    ).trim();

  const parentCategoryId =
    body.parentCategoryId
      ? String(
          body.parentCategoryId
        )
      : null;

  if (!name) {

    return Response.json(
      {
        error:
          'Category name is required',
      },

      {
        status: 400,
      }
    );
  }

  const duplicateFilters = [

    eq(
      categories.userId,
      userId
    ),

    ilike(
      categories.name,
      name
    ),
  ];

  if (
    parentCategoryId
  ) {

    duplicateFilters.push(
      eq(
        categories.parentCategoryId,
        parentCategoryId
      )
    );
  } else {

    duplicateFilters.push(
      isNull(
        categories.parentCategoryId
      )
    );
  }

  const [duplicate] =
    await db
      .select()
      .from(
        categories
      )
      .where(
        and(
          ...duplicateFilters
        )
      );

  if (
    duplicate
  ) {

    return Response.json(
      {
        error:
          'Category already exists',
      },

      {
        status: 409,
      }
    );
  }

  const [created] =
    await db
      .insert(
        categories
      )
      .values({

        userId,

        name,

        parentCategoryId,
      })
      .returning();

  return Response.json(
    created
  );
}
