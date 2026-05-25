import {
  NextResponse,
} from 'next/server';

import {
  ensureFinancialProjectionCoverage,
} from '@/services/ensure-financial-projection-coverage-service';

export async function
GET() {

  await ensureFinancialProjectionCoverage({

    userId:
      'user_3DasDuPX325vdPenZjdNQwiSaVx',

    untilReferenceMonth:
      '2028-12',
  });

  return NextResponse.json({
    success: true,
  });
}