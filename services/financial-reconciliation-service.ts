import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  and,
  eq,
  gte,
  lte,
} from 'drizzle-orm';

import {
  getProjectedTransactions,
} from './recurring-projection-service';

export async function
getFinancialReconciliation(

  userId: string,

  month: string
){
    const projected =
        await getProjectedTransactions(

        userId,

        month
    );

    const monthStart =
        `${month}-01`;

    const monthEnd =
        `${month}-31`;

    const realized =
    await db

    .select()

    .from(transactions)

    .where(
      and(

        eq(
          transactions.userId,
          userId
        ),

        gte(
          transactions.effectiveDate,
          monthStart
        ),

        lte(
          transactions.effectiveDate,
          monthEnd
        )
      )
    );

    const realizedByRecurring =
  new Map<
    string,

    {
      occurrences: number;

      total: number;
    }
  >();

  for (
  const transaction
  of realized
) {

  if (
    !transaction
      .recurringTransactionId
  ) {

    continue;
  }

  const current =

    realizedByRecurring
      .get(

        transaction
          .recurringTransactionId
      )

    ?? {

      occurrences: 0,

      total: 0,
    };

  current.occurrences += 1;

  current.total +=
    Number(
      transaction.amount
    );

  realizedByRecurring.set(

    transaction
      .recurringTransactionId,

    current
  );
}
const reconciliation =
  projected.map(
    (item) => {

      const realizedData =

        realizedByRecurring
          .get(

            item
              .recurringTransactionId
          )

        ?? {

          occurrences: 0,

          total: 0,
        };

      const remainingOccurrences =

        item
          .projectedOccurrences

        -

        realizedData
          .occurrences;

      const remainingTotal =

        item
          .projectedTotal

        -

        realizedData
          .total;

      return {

        recurringTransactionId:
          item
            .recurringTransactionId,

        description:
          item.description,

        projectedOccurrences:
          item
            .projectedOccurrences,

        realizedOccurrences:
          realizedData
            .occurrences,

        remainingOccurrences,

        projectedTotal:
          item
            .projectedTotal,

        realizedTotal:
          realizedData
            .total,

        remainingTotal,
      };
    }
  );
  return reconciliation;
}
