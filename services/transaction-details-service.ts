import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  financialOperations,
} from '@/db/schema/financial-operations';

import {
  installmentPlans,
} from '@/db/schema/installment-plans';

import {
  installments,
} from '@/db/schema/installments';

import {
  eq,
} from 'drizzle-orm';

type Props = {
  transactionId: string;
};

export async function
getTransactionDetails({
  transactionId,
}: Props) {

  /*
  TRANSACTION
  */

  const [transaction] =
    await db

      .select()

      .from(
        transactions
      )

      .where(
        eq(
          transactions.id,
          transactionId
        )
      );

  if (!transaction) {

    return null;
  }

  /*
  FINANCIAL OPERATION
  */

  if (
    !transaction
      .financialOperationId
  ) {

    return {

      transaction,

      operation: null,

      installmentPlan: null,

      installments: [],
    };
  }

  const [operation] =
    await db

      .select()

      .from(
        financialOperations
      )

      .where(
        eq(

          financialOperations.id,

          transaction
            .financialOperationId
        )
      );

  /*
  INSTALLMENT PLAN
  */

  const [installmentPlan] =
    await db

      .select()

      .from(
        installmentPlans
      )

      .where(
        eq(

          installmentPlans
            .financialOperationId,

          operation.id
        )
      );

  /*
  INSTALLMENTS
  */

  const installmentList =
    installmentPlan

      ? await db

          .select()

          .from(
            installments
          )

          .where(
            eq(

              installments
                .installmentPlanId,

              installmentPlan.id
            )
          )

      : [];

  return {

    transaction,

    operation,

    installmentPlan,

    installments:
      installmentList,
  };
}