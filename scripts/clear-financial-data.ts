import { db } from '@/db';

import {
  installments,
} from '@/db/schema/installments';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  installmentPlans,
} from '@/db/schema/installment-plans';

import {
  financialOperations,
} from '@/db/schema/financial-operations';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  financialMonths,
} from '@/db/schema/financial-months';

async function
run() {

  console.log(
    'Clearing financial data...',
  );

  /*
  INSTALLMENTS
  */

  await db.delete(
    installments
  );

  console.log(
    'installments cleared',
  );

  /*
  TRANSACTIONS
  */

  await db.delete(
    transactions
  );

  console.log(
    'transactions cleared',
  );

  /*
  INSTALLMENT PLANS
  */

  await db.delete(
    installmentPlans
  );

  console.log(
    'installment plans cleared',
  );

  /*
  FINANCIAL OPERATIONS
  */

  await db.delete(
    financialOperations
  );

  console.log(
    'financial operations cleared',
  );

  /*
  RECURRING TRANSACTIONS
  */

  await db.delete(
    recurringTransactions
  );

  console.log(
    'recurring transactions cleared',
  );

  /*
  RECURRENCES
  */

  await db.delete(
    recurrences
  );

  console.log(
    'recurrences cleared',
  );

  /*
  FINANCIAL MONTHS
  */

  await db.delete(
    financialMonths
  );

  console.log(
    'financial months cleared',
  );

  console.log(
    'Financial data cleared successfully.',
  );
}

run();