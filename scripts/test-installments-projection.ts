import { db } from '../db/index.ts';
import { paymentMethods } from '../db/schema/payment-methods.ts';
import { categories } from '../db/schema/categories.ts';
import { transactions } from '../db/schema/transactions.ts';
import { financialMonths } from '../db/schema/financial-months.ts';
import { eq } from 'drizzle-orm';
import { createFinancialOperation } from '../services/financial-operation-service.ts';
import { getProjectionMonth } from '../services/projection-service.ts';

async function run() {
  const userId = process.env.TEST_USER_ID || process.argv[2];

  if (!userId) {
    console.error('Usage: TEST_USER_ID=<userId> node scripts/test-installments-projection.ts <userId>');
    process.exit(1);
  }

  // pick a payment method and category for the user
  const [pm] = await db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).limit(1);
  const [cat] = await db.select().from(categories).where(eq(categories.userId, userId)).limit(1);

  if (!pm || !cat) {
    console.error('User must have at least one payment method and one category.');
    process.exit(1);
  }

  const today = new Date();
  const effectiveDate = today.toISOString().split('T')[0];

  console.log('Creating installment operation for user', userId);

  const result = await createFinancialOperation({
    userId,
    paymentMethodId: pm.id,
    categoryId: cat.id,
    description: 'TEST INSTALLMENT ' + Date.now(),
    amount: '300.00',
    operationType: 'INSTALLMENT_PURCHASE',
    transactionType: 'EXPENSE',
    status: 'CONFIRMED',
    occurredAt: new Date(effectiveDate),
    effectiveDate,
    dueDate: effectiveDate,
    installmentCount: 3,
  } as any);

  console.log('Created operation:', result.operation.id);

  const start = new Date(effectiveDate);
  const months = [] as string[];
  for (let i = 0; i < 3; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    months.push(d.toISOString().slice(0, 7));
  }

  for (const m of months) {
    console.log('\n--- Projection for', m, '---');
    const projection = await getProjectionMonth({ userId, referenceMonth: m, recurringPage: 1, transactionsPage: 1 });
    if (!projection) {
      console.log('No projection for', m);
      continue;
    }

    console.log('financialMonth id:', projection.financialMonth.id);
    console.log('recurringSnapshots count:', projection.recurringSnapshots.length);
    console.log('realizedTransactions count:', projection.realizedTransactions.length);
    console.log('expensesByCategory:', projection.expensesByCategory);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
