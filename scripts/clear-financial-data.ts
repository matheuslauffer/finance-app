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

  /*
  INSTALLMENTS
  */

  await db.delete(
    installments
  );

  /*
  TRANSACTIONS
  */

  await db.delete(
    transactions
  );

  /*
  INSTALLMENT PLANS
  */

  await db.delete(
    installmentPlans
  );

  /*
  FINANCIAL OPERATIONS
  */

  await db.delete(
    financialOperations
  );

  /*
  RECURRING TRANSACTIONS
  */

  await db.delete(
    recurringTransactions
  );

  /*
  RECURRENCES
  */

  await db.delete(
    recurrences
  );

  /*
  FINANCIAL MONTHS
  */

  await db.delete(
    financialMonths
  );

}

run();