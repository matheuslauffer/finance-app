import { db } from '@/db';

import {
  forecastSnapshots,
} from '@/db/schema/forecast-snapshots';

import {
  getCurrentFinancialMonth,
} from './current-financial-month-service';

import {
  eq,
  desc,
} from 'drizzle-orm';

export async function
getCurrentDashboard(
  userId: string
) {

  const currentMonth =
    await getCurrentFinancialMonth(
      userId
    );

  if (!currentMonth) {
    return null;
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

  return snapshots[0] ?? null;
}