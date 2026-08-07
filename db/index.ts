import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';

import postgres from 'postgres';

const globalForDb =
  globalThis as unknown as {
    queryClient?: postgres.Sql;
  };

const queryClient =
  globalForDb.queryClient
  ?? postgres(
    process.env.DATABASE_URL!,
    {
      max:
        5,

      prepare:
        false,
    }
  );

if (
  process.env.NODE_ENV
  !== 'production'
) {

  globalForDb.queryClient =
    queryClient;
}

export const db = drizzle(queryClient);
