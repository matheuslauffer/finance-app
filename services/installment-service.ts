import { db } from '@/db';

import {
  installmentPlans,
} from '@/db/schema/installment-plans';

import {
  installments,
} from '@/db/schema/installments';

type Props = {

  financialOperationId:
    string;

  amount:
    number;

  installmentCount:
    number;

  effectiveDate:
    string;
};

export async function
createInstallments({
  financialOperationId,
  amount,
  installmentCount,
  effectiveDate,
}: Props) {

  /*
  INSTALLMENT VALUE
  */

  const installmentValue =
    amount
    / installmentCount;

  /*
  DATES
  */

  const startDate =
    new Date(
      effectiveDate
    );

  const endDate =
    new Date(
      effectiveDate
    );

  endDate.setMonth(
    endDate.getMonth()
    + (
      installmentCount - 1
    )
  );

  /*
  CREATE PLAN
  */

  const [plan] =
    await db

      .insert(
        installmentPlans
      )

      .values({

        financialOperationId,

        totalAmount:
          String(amount),

        installmentAmount:
          String(
            installmentValue
          ),

        installmentCount,

        startMonth:
          startDate
            .toISOString()
            .split('T')[0],

        endMonth:
          endDate
            .toISOString()
            .split('T')[0],
      })

      .returning();

  /*
  CREATE INSTALLMENTS
  */

  for (
    let index = 0;
    index < installmentCount;
    index++
  ) {

    const dueDate =
      new Date(
        effectiveDate
      );

    dueDate.setMonth(
      dueDate.getMonth()
      + index
    );

    await db

      .insert(
        installments
      )

      .values({

        installmentPlanId:
          plan.id,

        installmentNumber:
          index + 1,

        amount:
          String(
            installmentValue
          ),

        dueDate:
          dueDate
            .toISOString()
            .split('T')[0],

        status:
          'PENDING',
      });
  }

  return plan;
}