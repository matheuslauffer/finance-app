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