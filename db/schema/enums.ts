import { pgEnum } from 'drizzle-orm/pg-core';

export const transactionTypeEnum = pgEnum(
  'transaction_type',
  [
    'INCOME',
    'EXPENSE',
    'TRANSFER',
    'ADJUSTMENT',
  ]
);

export const transactionStatusEnum = pgEnum(
  'transaction_status',
  [
    'PROJECTED',
    'CONFIRMED',
    'CANCELLED',
  ]
);

export const accountTypeEnum = pgEnum(
  'account_type',
  [
    'CHECKING',
    'SAVINGS',
    'DIGITAL_WALLET',
    'CASH',
    'INVESTMENT',
  ]
);

export const paymentMethodTypeEnum = pgEnum(
  'payment_method_type',
  [
    'PIX',
    'DEBIT',
    'CREDIT',
    'BOLETO',
    'BANK_TRANSFER',
    'CREDIT_LINE',
  ]
);

export const operationTypeEnum = pgEnum(
  'operation_type',
  [
    'PURCHASE',
    'PIX_CREDIT',
    'BOLETO_CREDIT',
    'INSTALLMENT_PURCHASE',
    'FINANCING',
    'TRANSFER',
  ]
);

export const installmentStatusEnum =
  pgEnum(
    'installment_status',
    [
      'PENDING',
      'PAID',
      'CANCELLED',
      'ANTICIPATED',
    ]
  );

  export const recurrenceFrequencyEnum =
  pgEnum(
    'recurrence_frequency',
    [
      'DAILY',
      'WEEKLY',
      'MONTHLY',
      'YEARLY',
    ]
  );