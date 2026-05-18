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
  inArray,
} from 'drizzle-orm';

import {
  recalculateFinancialMonth,
} from './recalculate-financial-month';

export async function
deleteTransaction(
  transactionId: string
) {

  const affectedFinancialMonthIds =
    new Set<string>();

  const [transaction] =
    await db.transaction(
      async (tx) => {

        const [currentTransaction] =
          await tx
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

        if (!currentTransaction) {

          return [];
        }

        if (
          !currentTransaction
            .financialOperationId
        ) {

          affectedFinancialMonthIds.add(
            currentTransaction
              .financialMonthId
          );

          await tx
            .delete(
              installments
            )
            .where(
              eq(
                installments
                  .transactionId,
                currentTransaction.id
              )
            );

          await tx
            .delete(
              transactions
            )
            .where(
              eq(
                transactions.id,
                currentTransaction.id
              )
            );

          return [
            currentTransaction,
          ];
        }

        const operationTransactions =
          await tx
            .select()
            .from(
              transactions
            )
            .where(
              eq(
                transactions
                  .financialOperationId,
                currentTransaction
                  .financialOperationId
              )
            );

        const operationTransactionIds =
          operationTransactions.map(
            (item) => item.id
          );

        for (
          const operationTransaction
          of operationTransactions
        ) {

          affectedFinancialMonthIds.add(
            operationTransaction
              .financialMonthId
          );
        }

        const operationInstallmentPlans =
          await tx
            .select()
            .from(
              installmentPlans
            )
            .where(
              eq(
                installmentPlans
                  .financialOperationId,
                currentTransaction
                  .financialOperationId
              )
            );

        const operationInstallmentPlanIds =
          operationInstallmentPlans.map(
            (item) => item.id
          );

        if (
          operationInstallmentPlanIds
            .length > 0
        ) {

          await tx
            .delete(
              installments
            )
            .where(
              inArray(
                installments
                  .installmentPlanId,
                operationInstallmentPlanIds
              )
            );
        }

        if (
          operationTransactionIds
            .length > 0
        ) {

          await tx
            .delete(
              installments
            )
            .where(
              inArray(
                installments
                  .transactionId,
                operationTransactionIds
              )
            );

          await tx
            .delete(
              transactions
            )
            .where(
              inArray(
                transactions.id,
                operationTransactionIds
              )
            );
        }

        if (
          operationInstallmentPlanIds
            .length > 0
        ) {

          await tx
            .delete(
              installmentPlans
            )
            .where(
              inArray(
                installmentPlans.id,
                operationInstallmentPlanIds
              )
            );
        }

        await tx
          .delete(
            financialOperations
          )
          .where(
            eq(
              financialOperations.id,
              currentTransaction
                .financialOperationId
            )
          );

        return operationTransactions;
      }
    );

  if (!transaction) {

    return;
  }

  for (
    const financialMonthId
    of affectedFinancialMonthIds
  ) {

    await recalculateFinancialMonth(
      financialMonthId
    );
  }
}
