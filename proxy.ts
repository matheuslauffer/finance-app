import {
  clerkMiddleware,
  createRouteMatcher,
} from '@clerk/nextjs/server';

const isProtectedRoute =
  createRouteMatcher([
    '/dashboard(.*)',
    '/transactions(.*)',
    '/import(.*)',
  ]);

export default clerkMiddleware(
  async (auth, request) => {

    if (
      isProtectedRoute(request)
    ) {

      await auth.protect();
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