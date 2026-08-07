'use server';

import { getTransactions } from '@/services/transaction-service';

export async function loadMoreTransactions({
  userId,
  search,
  transactionType,
  paymentMethodId,
  cursor,
}: {
  userId: string;
  search?: string;
  transactionType?: 'INCOME' | 'EXPENSE';
  paymentMethodId?: string;
  cursor?: string;
}) {
  return await getTransactions({
    userId,
    search,
    transactionType,
    paymentMethodId,
    limit: 20,
    cursor,
  });
}
