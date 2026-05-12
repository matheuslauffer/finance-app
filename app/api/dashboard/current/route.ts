import {
  auth,
} from '@clerk/nextjs/server';

import { db } from '@/db';

import {
  forecastSnapshots,
} from '@/db/schema/forecast-snapshots';

import {
  getCurrentFinancialMonth,
} from '@/services/current-financial-month-service';

import {
  eq,
  desc,
} from 'drizzle-orm';

export async function GET() {

  const { userId } =
    await auth();

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

  const currentMonth =
    await getCurrentFinancialMonth(
      userId
    );

  if (!currentMonth) {

    return Response.json(null);
  }

  const snapshots =
    await db
      .select()
      .from(forecastSnapshots)
      .where(
        eq(
          forecastSnapshots
            .financialMonthId,

          currentMonth.id
        )
      )
      .orderBy(
        desc(
          forecastSnapshots
            .calculatedAt
        )
      )
      .limit(1);

  return Response.json(
    snapshots[0] ?? null
  );
}