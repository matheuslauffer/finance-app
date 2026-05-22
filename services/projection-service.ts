import { db } from '@/db';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  and,
  eq,
} from 'drizzle-orm';

type Input = {

  userId: string;

  referenceMonth: string;
};

export async function
getProjectionMonth({
  userId,
  referenceMonth,
}: Input) {
    const [financialMonth] =
        await db

            .select()

            .from(financialMonths)

            .where(
                and(

                    eq(
                    financialMonths.userId,
                    userId
                    ),

                    eq(
                    financialMonths.referenceMonth,
                    referenceMonth
                    )
                )
            );
    
    if (!financialMonth) {

        return null;
    }

    const recurringSnapshots =
        await db

            .select()

            .from(recurringTransactions)

            .where(
                eq(
                    recurringTransactions
                    .financialMonthId,

                    financialMonth.id
                )
            );

    const realizedTransactions =
        await db

            .select()

            .from(transactions)

            .where(
                eq(
                    transactions.financialMonthId,
                    financialMonth.id
                )
            );

    return {

        financialMonth,

        recurringSnapshots,

        realizedTransactions,
    };
}