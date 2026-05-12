import { db } from '@/db';

import {
  forecastSnapshots,
} from '@/db/schema/forecast-snapshots';

import {
  eq,
  desc,
} from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: {
    params: Promise<{
      monthId: string;
    }>;
  }
) {

  const { monthId } =
    await params;

  const snapshots =
    await db
      .select()
      .from(forecastSnapshots)
      .where(
        eq(
          forecastSnapshots
            .financialMonthId,

          monthId
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
    snapshots[0] ?? {}
  );
}