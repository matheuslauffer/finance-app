import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import {
  getCurrentFinancialMonth,
} from '@/services/current-financial-month-service';

export default async function
ProjectionsPage() {

  const session =
    await auth();

  if (!session.userId) {

    redirect('/sign-in');
  }

  const currentFinancialMonth =
    await getCurrentFinancialMonth(
      session.userId
    );

  redirect(
    `/projections/${currentFinancialMonth.referenceMonth}`
  );
}
