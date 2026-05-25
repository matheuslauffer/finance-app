import { db } from '@/db';

import {
  categories,
} from '@/db/schema/categories';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  users,
} from '@/db/schema/users';

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
  and,
} from 'drizzle-orm';

import {
  ImportPayload,
} from '@/types/import-payload';

import {
  recalculateFinancialMonth,
} from './recalculate-financial-month';

import {
  resolveFinancialMonth,
} from './financial-month-service';

function
inferPaymentMethodType(
  paymentMethod: string
):
  | 'PIX'
  | 'DEBIT'
  | 'CREDIT_CARD'
  | 'BOLETO'
  | 'BANK_TRANSFER'
  | 'CREDIT_LINE'
{

  const normalized =
    paymentMethod
      .toLowerCase();

  if (
    normalized.includes(
      'pix'
    )
  ) {

    return 'PIX';
  }

  if (
    normalized.includes(
      'boleto'
    )
  ) {

    return 'BOLETO';
  }

  if (
    normalized.includes(
      'nubank'
    )
    ||
    normalized.includes(
      'visa'
    )
    ||
    normalized.includes(
      'master'
    )
    ||
    normalized.includes(
      'crédito'
    )
    ||
    normalized.includes(
      'credito'
    )
  ) {

    return 'CREDIT_CARD';
  }

  if (
    normalized.includes(
      'débito'
    )
    ||
    normalized.includes(
      'debito'
    )
  ) {

    return 'DEBIT';
  }

  if (
    normalized.includes(
      'transfer'
    )
  ) {

    return 'BANK_TRANSFER';
  }

  return 'CREDIT_CARD';
}

function
inferTransactionType(
  description: string,

  category: string
):
  | 'INCOME'
  | 'EXPENSE'
{

  const normalized =
    (
      description
      + ' '
      + category
    ).toLowerCase();

  /*
  INCOME RULES
  */

  if (
    normalized.includes(
      'salário'
    )
    ||
    normalized.includes(
      'salario'
    )
    ||
    normalized.includes(
      'recebido'
    )
    ||
    normalized.includes(
      'rendimento'
    )
    ||
    normalized.includes(
      'cashback'
    )
    ||
    normalized.includes(
      'pix recebido'
    )
  ) {

    return 'INCOME';
  }

  return 'EXPENSE';
}

export async function
importTransactions(
  userId: string,

  rows: ImportPayload[]
) {

  /*
  USER
  */

  const [existingUser] =
    await db

      .select()

      .from(users)

      .where(
        eq(
          users.id,
          userId
        )
      );

  if (!existingUser) {

    await db

      .insert(users)

      .values({

        id: userId,

        name:
          'Imported User',

        email:
          `${userId}@local.dev`,
      });
  }

  /*
  INSTALLMENT MAP
  */

  const installmentOperationMap =
    new Map<string, {

      operationId: string;

      installmentPlanId: string;
    }>();

  /*
  IMPORT LOOP
  */

  for (
    const row
    of rows
  ) {

    /*
    CATEGORY
    */

    let [category] =
      await db

        .select()

        .from(categories)

        .where(
          and(

            eq(
              categories.userId,
              userId
            ),

            eq(
              categories.name,
              row.category
            )
          )
        );

    if (!category) {

      const created =
        await db

          .insert(categories)

          .values({

            userId,

            name:
              row.category,
          })

          .returning();

      category =
        created[0];
    }

    /*
    PAYMENT METHOD
    */

    let [paymentMethod] =
      await db

        .select()

        .from(paymentMethods)

        .where(
          and(

            eq(
              paymentMethods.userId,
              userId
            ),

            eq(
              paymentMethods.name,
              row.paymentMethod
            )
          )
        );

    if (!paymentMethod) {

      const created =
        await db

          .insert(paymentMethods)

          .values({

            userId,

            name:
              row.paymentMethod,

            methodType:
              inferPaymentMethodType(
                row.paymentMethod
              ),
          })

          .returning();

      paymentMethod =
        created[0];
    }

    /*
    FINANCIAL MONTH
    */

    const occurredAt =
      new Date(
        row.transactionDate
      );

    const financialDate =
      new Date(
        row.dueDate
        ?? row.transactionDate
      );

    const financialMonth =
      await resolveFinancialMonth(

        userId,

        paymentMethod.id,

        financialDate
      );

    /*
    INSTALLMENT KEY
    */

    const installmentKey =
      `${row.description}-${row.amount}-${row.transactionDate}`;

    /*
    INSTALLMENT FLOW
    */

    let financialOperationId:
      string | null = null;

    if (
      row.installmentCount > 1
    ) {

      let existingInstallment =
        installmentOperationMap.get(
          installmentKey
        );

      /*
      CREATE OPERATION
      */

      if (!existingInstallment) {

        const [operation] =
          await db

            .insert(
              financialOperations
            )

            .values({

              userId,

              operationType:
                'INSTALLMENT_PURCHASE',

              description:
                row.description,

              totalAmount:
                String(row.amount),
            })

            .returning();

        const [installmentPlan] =
          await db

            .insert(
              installmentPlans
            )

            .values({

              financialOperationId:
                operation.id,

              totalAmount:
                String(row.amount),

              installmentAmount:
                String(
                  row.installmentAmount
                ),

              installmentCount:
                row.installmentCount,

              startMonth:
                row.transactionDate,

              endMonth:
                row.dueDate
                ?? row.transactionDate,
            })

            .returning();

        installmentOperationMap.set(

          installmentKey,

          {

            operationId:
              operation.id,

            installmentPlanId:
              installmentPlan.id,
          }
        );

        existingInstallment = {

          operationId:
            operation.id,

          installmentPlanId:
            installmentPlan.id,
        };
      }

      financialOperationId =
        existingInstallment.operationId;
    }

    /*
    TRANSACTION
    */

    const [transaction] =
      await db

        .insert(transactions)

        .values({

          userId,

          financialOperationId,

          categoryId:
            category.id,

          paymentMethodId:
            paymentMethod.id,

          financialMonthId:
            financialMonth.id,

          description:
            row.description,

          amount:
            String(
              row.installmentAmount
              || row.amount
            ),

          transactionType:
            inferTransactionType(

              row.description,

              row.category
            ),

          status:
            'CONFIRMED',

          occurredAt,

          effectiveDate:
            row.transactionDate,

          dueDate:
            row.dueDate
            ?? row.transactionDate,
        })

        .returning();

    /*
    INSTALLMENT
    */

    if (
      row.installmentCount > 1
    ) {

      const installmentData =
        installmentOperationMap.get(
          installmentKey
        );

      if (installmentData) {

        await db

          .insert(
            installments
          )

          .values({

            installmentPlanId:
              installmentData.installmentPlanId,

            transactionId:
              transaction.id,

            installmentNumber:
              row.installmentNumber,

            dueDate:
              String(row.dueDate)
              ?? String(row.dueDate),

            amount:
              String(
                row.installmentAmount
              ),

            status:
              'PENDING',
          });
      }
    }

    /*
    RECALCULATE
    */

    await recalculateFinancialMonth(
      financialMonth.id
    );
  }
}