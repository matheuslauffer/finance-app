export type CreateFinancialOperationInput =
{
  userId: string;

  paymentMethodId: string;

  categoryId: string;

  description: string;

  amount: string;

  installmentCount?: number;

  operationType:
    | 'PURCHASE'
    | 'PIX_CREDIT'
    | 'BOLETO_CREDIT'
    | 'INSTALLMENT_PURCHASE';

  transactionType:
    | 'INCOME'
    | 'EXPENSE';

  status:
    | 'PROJECTED'
    | 'CONFIRMED';

  occurredAt: Date;

  effectiveDate: string;

  dueDate: string;
};