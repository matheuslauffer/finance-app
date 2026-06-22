import {
  NextResponse,
} from 'next/server';

import {
  db,
} from '@/db';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  recalculateFinancialMonth,
} from '@/services/recalculate-financial-month';

export async function
GET() {

  const months =
    await db

      .select()

      .from(
        financialMonths
      );

  for (const month of months) {

    await recalculateFinancialMonth(
      month.id
    );
  }

  return NextResponse.json({

    success: true,

    recalculated:
      months.length,
  });
}