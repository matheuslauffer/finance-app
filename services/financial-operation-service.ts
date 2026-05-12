import { db } from "@/db";

import { financialOperations } from "@/db/schema/financial-operations";

import { transactions } from "@/db/schema/transactions";

import { installmentPlans } from "@/db/schema/installment-plans";

import { installments } from "@/db/schema/installments";

import { calculateInstallmentAmount } from "@/lib/installment";

import { addMonths } from "@/lib/date";

import { CreateFinancialOperationInput } from "@/types/create-financial-operation";

import { recalculateForecast } from "./forecast-service";

import {
  resolveFinancialMonth,
} from './financial-month-service';

export async function createFinancialOperation(
  input: CreateFinancialOperationInput,
) {
  return await db.transaction(async (tx) => {
    // 1. Create operation

    const [operation] = await tx
      .insert(financialOperations)
      .values({
        userId: input.userId,

        operationType: input.operationType,

        description: input.description,

        totalAmount: input.amount,
      })
      .returning();

    // 2. Simple transaction

    const financialMonth =
  await resolveFinancialMonth(
    input.userId,
    input.paymentMethodId,
    input.occurredAt
  );

    if (!input.installmentCount || input.installmentCount <= 1) {
      const [transaction] = await tx
        .insert(transactions)
        .values({
          userId: input.userId,

          financialOperationId: operation.id,

          paymentMethodId: input.paymentMethodId,

          categoryId: input.categoryId,

          financialMonthId: financialMonth.id,

          description: input.description,

          amount: input.amount,

          transactionType: input.transactionType,

          status: input.status,

          occurredAt: input.occurredAt,

          effectiveDate: input.effectiveDate,
        })
        .returning();

      return {
        operation,
        transaction,
      };
    }

    // 3. Installment flow

    const installmentAmount = calculateInstallmentAmount(
      Number(input.amount),
      input.installmentCount,
    );

    const startDate = new Date(input.effectiveDate);

    const endDate = addMonths(startDate, input.installmentCount - 1);

    // 4. Create installment plan

    const [installmentPlan] = await tx
      .insert(installmentPlans)
      .values({
        financialOperationId: operation.id,

        totalAmount: input.amount,

        installmentAmount: installmentAmount.toString(),

        installmentCount: input.installmentCount,

        startMonth: startDate.toISOString().split("T")[0],

        endMonth: endDate.toISOString().split("T")[0],
      })
      .returning();

    const createdTransactions = [];

    // 5. Create installments

    for (let i = 0; i < input.installmentCount; i++) {
      const installmentDate = addMonths(startDate, i);

      const [transaction] = await tx
        .insert(transactions)
        .values({
          userId: input.userId,

          financialOperationId: operation.id,

          paymentMethodId: input.paymentMethodId,

          categoryId: input.categoryId,

          financialMonthId: financialMonth.id,

          description: `${input.description}
                (${i + 1}/
                ${input.installmentCount})`,

          amount: installmentAmount.toString(),

          transactionType: input.transactionType,

          status: input.status,

          occurredAt: input.occurredAt,

          effectiveDate: installmentDate.toISOString().split("T")[0],
        })
        .returning();

      await tx.insert(installments).values({
        installmentPlanId: installmentPlan.id,

        transactionId: transaction.id,

        installmentNumber: i + 1,

        dueDate: installmentDate.toISOString().split("T")[0],

        amount: installmentAmount.toString(),

        status: "PENDING",
      });

      createdTransactions.push(transaction);
    }

    await recalculateForecast(input.userId, financialMonth.id);

    return {
      operation,
      installmentPlan,
      transactions: createdTransactions,
    };
  });
}
