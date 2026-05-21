import { db } from '@/db';

import {
  users,
} from '@/db/schema/users';

import {
  eq,
} from 'drizzle-orm';

type Input = {
  id: string;

  email: string;

  name: string;
};

export async function
ensureUserExists({
  id,
  email,
  name,
}: Input) {

  const [existingUser] =
    await db

      .select()

      .from(users)

      .where(
        eq(
          users.id,
          id
        )
      );

  if (existingUser) {

    return existingUser;
  }

  const [createdUser] =
    await db

      .insert(users)

      .values({

        id,

        email,

        name,
      })

      .returning();

  return createdUser;
}