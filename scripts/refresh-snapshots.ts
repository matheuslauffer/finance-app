import {
  db,
} from '@/db';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  ilike,
} from 'drizzle-orm';

import {
  recalculateFinancialMonth,
} from '@/services/recalculate-financial-month';

async function run() {

  /*
  RECURRENCES
  */

  await db

    .update(recurrences)

    .set({

      transactionType:
        'INCOME',
    })

    .where(
      ilike(
        recurrences.description,
        '%salário%'
      )
    );

  /*
  SNAPSHOTS
  */

  await db

    .update(
      recurringTransactions
    )

    .set({

      transactionType:
        'INCOME',
    })

    .where(
      ilike(
        recurringTransactions.description,
        '%salário%'
      )
    );

  /*
  RECALCULATE
  */

  const months =
    await db

      .select()

      .from(financialMonths);

  for (
    const month
    of months
  ) {

    await recalculateFinancialMonth(
      month.id
    );
  }

  process.exit(0);
}

run().catch((error) => {

  console.error(error);

  process.exit(1);
});