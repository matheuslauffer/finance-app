import {
  NextResponse,
} from 'next/server';

import {
  db,
} from '@/db';

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
  gte,
} from 'drizzle-orm';

import {
  getFinancialCompetencyDate,
} from '@/lib/payment-method-competency';

export async function
GET() {

  const results =
    await db

      .select({

        transaction:
          transactions,

        paymentMethod:
          paymentMethods,

        financialMonth:
          financialMonths,
      })

      .from(
        transactions
      )

      .leftJoin(

        paymentMethods,

        eq(
          transactions.paymentMethodId,
          paymentMethods.id
        )
      )

      .leftJoin(

        financialMonths,

        eq(
          transactions.financialMonthId,
          financialMonths.id
        )
      )

      .where(
        gte(
          transactions.occurredAt,
          new Date(
            '2026-05-08T00:00:00'
          )
        )
      );

  const updated = [];

  for (const item of results) {

    /*
    CREDIT CARD ONLY
    */

    if (
      item.paymentMethod?.methodType
      !== 'CREDIT_CARD'
    ) {

      continue;
    }

    const competencyDate =
      getFinancialCompetencyDate({

        occurredAt:
          new Date(
            item.transaction.occurredAt
          ),

        closingDay:
          item.paymentMethod
            ?.closingDay
          ?? null,

        dueDay:
          item.paymentMethod
            ?.dueDay
          ?? null,
      });

    const expectedMonth =
      competencyDate
        .toISOString()
        .slice(0, 7);

    /*
    ALREADY CORRECT
    */

    if (
      item.financialMonth
        ?.referenceMonth
      === expectedMonth
    ) {

      continue;
    }

    /*
    TARGET MONTH
    */

    const [targetMonth] =
      await db

        .select()

        .from(
          financialMonths
        )

        .where(
          and(

            eq(
              financialMonths.userId,
              item.transaction.userId
            ),

            eq(
              financialMonths.referenceMonth,
              expectedMonth
            )
          )
        );

    if (!targetMonth) {

      continue;
    }

    /*
    UPDATE
    */

    await db

      .update(
        transactions
      )

      .set({

        financialMonthId:
          targetMonth.id,
      })

      .where(
        eq(
          transactions.id,
          item.transaction.id
        )
      );

    updated.push({

      description:
        item.transaction.description,

      from:
        item.financialMonth
          ?.referenceMonth,

      to:
        expectedMonth,
    });
  }

  return NextResponse.json({

    updatedCount:
      updated.length,

    updated,
  });
}