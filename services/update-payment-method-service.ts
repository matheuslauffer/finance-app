import {
  db,
} from '@/db';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  and,
  eq,
} from 'drizzle-orm';

import {
  recalculateRecurringProjections,
} from './recalculate-recurring-projections-service';

type Input = {

  id: string;

  userId: string;

  name: string;

  methodType:
    | 'PIX'
    | 'DEBIT'
    | 'CREDIT_CARD'
    | 'BOLETO'
    | 'BANK_TRANSFER'
    | 'CREDIT_LINE'
    | 'AUTO_DEBIT';

  closingDay:
    number | null;

  dueDay:
    number | null;

  supportsInstallments:
    boolean;

  requiresManualPayment:
    boolean;

  isActive:
    boolean;
};

export async function
updatePaymentMethod({

  id,

  userId,

  name,

  methodType,

  closingDay,

  dueDay,

  supportsInstallments,

  requiresManualPayment,

  isActive,
}: Input) {

  /*
  UPDATE METHOD
  */

  await db

    .update(paymentMethods)

    .set({

      name,

      methodType,

      closingDay,

      dueDay,

      supportsInstallments,

      requiresManualPayment,

      isActive,
    })

    .where(
      and(

        eq(
          paymentMethods.id,
          id
        ),

        eq(
          paymentMethods.userId,
          userId
        )
      )
    );

  /*
  FIND AFFECTED RECURRENCES
  */

  const affectedRecurrences =
    await db

      .selectDistinct({

        recurrenceId:
          recurringTransactions
            .recurrenceId,
      })

      .from(
        recurringTransactions
      )

      .where(
        eq(
          recurringTransactions
            .paymentMethodId,

          id
        )
      );

  /*
  RECALCULATE
  */

  for (
    const recurrence
    of affectedRecurrences
  ) {

    await recalculateRecurringProjections({

      recurrenceId:
        recurrence.recurrenceId,
    });
  }
}