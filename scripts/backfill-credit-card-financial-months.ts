import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  eq,
  and,
} from 'drizzle-orm';

import {
  resolveFinancialReferenceMonth,
} from '@/lib/resolve-financial-reference-month';

import {
  recalculateFinancialMonth,
} from '@/services/recalculate-financial-month';

async function
run() {

  console.log(
    'BACKFILL STARTED'
  );

  const affectedMonths =
    new Set<string>();

  const allTransactions =
    await db

      .select()

      .from(transactions);

  for (
    const transaction
    of allTransactions
  ) {

    /*
    PAYMENT METHOD
    */

    const [paymentMethod] =
      await db

        .select()

        .from(paymentMethods)

        .where(
          eq(
            paymentMethods.id,
            transaction.paymentMethodId
          )
        );

    if (!paymentMethod) {

      continue;
    }

    /*
    ONLY CREDIT CARD
    */

    if (
      paymentMethod.methodType
      !== 'CREDIT_CARD'
    ) {

      continue;
    }

    /*
    CALCULATE CORRECT MONTH
    */

    const occurredAt =
      new Date(
        transaction.occurredAt
      );

    const correctReferenceMonth =
      resolveFinancialReferenceMonth({

        occurredAt,

        paymentMethodType:
          paymentMethod.methodType,

        invoiceClosingDay:
          paymentMethod.closingDay
          ?? undefined,

        invoiceDueDay:
          paymentMethod.dueDay
          ?? undefined,
      });

    /*
    FIND TARGET MONTH
    */

    let [targetMonth] =
      await db

        .select()

        .from(financialMonths)

        .where(
          and(

            eq(
              financialMonths.userId,
              transaction.userId
            ),

            eq(
              financialMonths.referenceMonth,
              correctReferenceMonth
            )
          )
        );

    /*
    CREATE MONTH IF NEEDED
    */

    if (!targetMonth) {

      const [createdMonth] =
        await db

          .insert(financialMonths)

          .values({

            userId:
              transaction.userId,

            referenceMonth:
              correctReferenceMonth,

            projectedIncome:
              '0',

            projectedExpense:
              '0',

            projectedBalance:
              '0',

            committedAmount:
              '0',

            status:
              'OPEN',
          })

          .returning();

      targetMonth =
        createdMonth;
    }

    /*
    SAME MONTH
    */

    if (
      transaction.financialMonthId
      === targetMonth.id
    ) {

      continue;
    }

    console.log({

      description:
        transaction.description,

      from:
        transaction.financialMonthId,

      to:
        targetMonth.id,

      referenceMonth:
        correctReferenceMonth,
    });

    /*
    STORE OLD MONTH
    */

    const previousFinancialMonthId =
      transaction.financialMonthId;

    /*
    UPDATE TRANSACTION
    */

    await db

      .update(transactions)

      .set({

        financialMonthId:
          targetMonth.id,
      })

      .where(
        eq(
          transactions.id,
          transaction.id
        )
      );

    /*
    TRACK RECALC
    */

    affectedMonths.add(
      previousFinancialMonthId
    );

    affectedMonths.add(
      targetMonth.id
    );
  }

  /*
  RECALCULATE MONTHS
  */

  console.log(
    'RECALCULATING MONTHS'
  );

  for (
    const monthId
    of affectedMonths
  ) {

    console.log(
      'RECALCULATING',
      monthId
    );

    await recalculateFinancialMonth(
      monthId
    );
  }

  console.log(
    'BACKFILL FINISHED'
  );
}

run();