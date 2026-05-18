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
  financialMonths,
} from '@/db/schema/financial-months';

import {
  users,
} from '@/db/schema/users';

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
  IMPORT LOOP
  */

  for (const row of rows) {

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

    const referenceMonth =
      row.transactionDate
        .slice(0, 7)
      + '-01';

    let [financialMonth] =
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
              financialMonths
                .referenceMonth,

              referenceMonth
            )
          )
        );

    if (!financialMonth) {

      const created =
        await db
          .insert(
            financialMonths
          )
          .values({

            userId,

            referenceMonth,
          })
          .returning();

      financialMonth =
        created[0];
    }

    /*
    TRANSACTION
    */

    await db
      .insert(transactions)
      .values({

        userId,

        categoryId:
          category.id,

        paymentMethodId:
          paymentMethod.id,

        financialMonthId:
          financialMonth.id,

        description:
          row.description,

        amount:
          String(row.amount),

        transactionType:
          inferTransactionType(

            row.description,

            row.category
          ),

        status:
          'CONFIRMED',

        occurredAt:
          new Date(
            row.transactionDate
          ),

        effectiveDate:
          row.transactionDate,
      });

    /*
    RECALCULATE
    */

    await recalculateFinancialMonth(
      financialMonth.id
    );
  }
}
