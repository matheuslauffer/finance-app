import {
  clerkMiddleware,
  createRouteMatcher,
} from '@clerk/nextjs/server';

import { db } from '@/db';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';

const isProtectedRoute =
  createRouteMatcher([
    '/dashboard(.*)',
    '/transactions(.*)',
    '/import(.*)',
    '/projections(.*)',
    '/api(.*)',
  ]);

export default clerkMiddleware(
  async (auth, request) => {

    if (
      isProtectedRoute(request)
    ) {

      await auth.protect();
    }

    const { userId, sessionClaims } = await auth();

    if (userId) {
      try {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (
          existingUser.length === 0
        ) {
          await db
            .insert(users)
            .values({
              id: userId,
              email:
                (sessionClaims?.email as string) ||
                `user_${userId}@app.local`,
              name:
                (sessionClaims?.name as string) ||
                `User ${userId}`,
            });
        }
      } catch (error) {
        console.error(
          'Error syncing user:',
          error
        );
      }
    }
  },

  {
    clockSkewInMs: 15000,
  }
);

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
};