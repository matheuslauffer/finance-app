import {
  deleteTransaction,
} from './delete-transaction';

export async function
deleteFinancialOperation(
  transactionId: string
) {

  await deleteTransaction(
    transactionId
  );
}
