import { db } from '@/db';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

export async function GET() {

  const result =
    await db
      .select()
      .from(paymentMethods);

  return Response.json(result);
}