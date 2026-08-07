import { db } from '@/db';

import {
  financialOperations,
} from '@/db/schema/financial-operations';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  installmentPlans,
} from '@/db/schema/installment-plans';

import {
  installments,
} from '@/db/schema/installments';

import {
  calculateInstallmentAmount,
} from '@/lib/installment';

import {
  addMonths,
} from '@/lib/date';

import {
  and,
  eq,
} from 'drizzle-orm';

import {
  CreateFinancialOperationInput,
} from '@/types/create-financial-operation';

import {
  recalculateForecast,
} from './forecast-service';

import {
  resolveFinancialMonth,
} from './financial-month-service';

import {
  financialMonths,
} from '@/db/schema/financial-months';

import {
  resolveFinancialMonthStatus,
} from '@/lib/financial-month-status';

import {
  ensureFinancialProjectionCoverage,
} from './ensure-financial-projection-coverage-service';

import {
  reconcileRecurringTransaction,
} from './reconcile-recurring-transaction-service';

export async function
createFinancialOperation(
  input: CreateFinancialOperationInput,
) {

  return await db.transaction(

    async (tx) => {

      /*
      1. CREATE OPERATION
      */

      const [operation] =
        await tx

          .insert(
            financialOperations
          )

          .values({

            userId:
              input.userId,

            operationType:
              input.operationType,

            description:
              input.description,

            totalAmount:
              input.amount,
          })

          .returning();

      /*
      2. RESOLVE FINANCIAL MONTH
      */

      const financialMonth =
        await resolveFinancialMonth(

          input.userId,

          input.paymentMethodId,

          input.occurredAt
        );

        if (
          financialMonth.status
          === 'CLOSED'
        ) {

          throw new Error(
            'Financial month is closed'
          );
        }

      /*
      3. SIMPLE TRANSACTION
      */

      if (
        !input.installmentCount
        ||
        input.installmentCount <= 1
      ) {

        const [transaction] =
          await tx

            .insert(
              transactions
            )

            .values({

              userId:
                input.userId,

              financialOperationId:
                operation.id,

              paymentMethodId:
                input.paymentMethodId,

              categoryId:
                input.categoryId,

              financialMonthId:
                financialMonth.id,

              description:
                input.description,

              amount:
                input.amount,

              transactionType:
                input.transactionType,

              status:
                input.status,

              occurredAt:
                input.occurredAt,

              effectiveDate:
                input.effectiveDate,

              recurringTransactionId:
                input.recurringTransactionId,
            })

            .returning();

        /*
        RECONCILE RECURRING
        */

        await reconcileRecurringTransaction({

          transactionId:
            transaction.id,

          financialMonthId:
            financialMonth.id,

          categoryId:
            input.categoryId,

          amount:
            input.amount,

          recurringTransactionId:
            input.recurringTransactionId,
        });

        /*
        RECALCULATE FORECAST
        */

        await recalculateForecast(
          financialMonth
        );

        return {

          operation,

          transaction,
        };
      }

      /*
      4. INSTALLMENT FLOW
      */

      const installmentAmount =
        calculateInstallmentAmount(

          Number(
            input.amount
          ),

          input.installmentCount,
        );

      const startDate =
        new Date(
          input.effectiveDate
        );

      const endDate =
        addMonths(
          startDate,
          input.installmentCount - 1
        );

      /*
      5. CREATE INSTALLMENT PLAN
      */

      const [installmentPlan] =
        await tx

          .insert(
            installmentPlans
          )

          .values({

            financialOperationId:
              operation.id,

            totalAmount:
              input.amount,

            installmentAmount:
              installmentAmount
                .toString(),

            installmentCount:
              input.installmentCount,

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

      const createdTransactions = [];

      /*
      6. CREATE INSTALLMENTS
      */

      let lastInstallmentDate:
        Date | null = null;

      for (
        let i = 0;
        i < input.installmentCount;
        i++
      ) {

        const installmentDate =
          addMonths(
            startDate,
            i
          );

        lastInstallmentDate =
          installmentDate;

        // For installments we want each parcel to belong to the calendar
        // reference month of the installment date (YYYY-MM), regardless of
        // payment method competency. This makes projections show each
        // installment in its respective month.
        const installmentReferenceMonth =
          installmentDate.toISOString().slice(0, 7);

        let [installmentFinancialMonth] =
          await tx
            .select()
            .from(financialMonths)
            .where(
              and(
                eq(financialMonths.userId, input.userId),
                eq(financialMonths.referenceMonth, installmentReferenceMonth)
              )
            );

        if (!installmentFinancialMonth) {
          const [createdMonth] =
            await tx
              .insert(financialMonths)
              .values({
                userId: input.userId,
                referenceMonth: installmentReferenceMonth,
                projectedIncome: '0',
                projectedExpense: '0',
                projectedBalance: '0',
                committedAmount: '0',
                status: resolveFinancialMonthStatus(installmentReferenceMonth),
              })
              .returning();

          installmentFinancialMonth = createdMonth;
        }

        const [transaction] =
          await tx

            .insert(
              transactions
            )

            .values({

              userId:
                input.userId,

              financialOperationId:
                operation.id,

              paymentMethodId:
                input.paymentMethodId,

              categoryId:
                input.categoryId,

              financialMonthId:
                installmentFinancialMonth.id,

              description:
                `${input.description} (${i + 1}/${input.installmentCount})`,

              amount:
                installmentAmount
                  .toString(),

              transactionType:
                input.transactionType,

              status:
                input.status,

              occurredAt:
                input.occurredAt,

              effectiveDate:
                installmentDate
                  .toISOString()
                  .split('T')[0],
            })

            .returning();

        /*
        RECONCILE RECURRING
        */

        await reconcileRecurringTransaction({

          transactionId:
            transaction.id,

          financialMonthId:
            installmentFinancialMonth.id,

          categoryId:
            input.categoryId,

          amount:
            installmentAmount.toString(),
        });

        /*
        CREATE INSTALLMENT RECORD
        */

        await tx

          .insert(
            installments
          )

          .values({

            installmentPlanId:
              installmentPlan.id,

            transactionId:
              transaction.id,

            installmentNumber:
              i + 1,

            dueDate:
              installmentDate
                .toISOString()
                .split('T')[0],

            amount:
              installmentAmount
                .toString(),

            status:
              'PENDING',
          });

        createdTransactions.push(
          transaction
        );

        /*
        RECALCULATE FORECAST
        */

        await recalculateForecast(
          installmentFinancialMonth
        );
      }

      /*
      7. ENSURE PROJECTION COVERAGE
      */

      if (
        lastInstallmentDate
      ) {

        const lastReferenceMonth =
          lastInstallmentDate

            .toISOString()

            .slice(0, 7);

        await ensureFinancialProjectionCoverage({

          userId:
            input.userId,

          untilReferenceMonth:
            lastReferenceMonth,
        });
      }

      return {

        operation,

        installmentPlan,

        transactions:
          createdTransactions,
      };
    }
  );
}