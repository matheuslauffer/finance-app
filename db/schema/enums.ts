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

export type TransactionType =

  typeof transactionTypeEnum
    .enumValues[number];

export const transactionStatusEnum = pgEnum(
  'transaction_status',
  [
    'PROJECTED',
    'CONFIRMED',
    'CANCELLED',
  ]
);

export type TransactionStatus =

  typeof transactionStatusEnum
    .enumValues[number];

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

export type AccountType =

  typeof accountTypeEnum
    .enumValues[number];

export const paymentMethodTypeEnum = pgEnum(
  'payment_method_type',
  [
    'PIX',
    'DEBIT',
    'CREDIT_CARD',
    'BOLETO',
    'BANK_TRANSFER',
    'CREDIT_LINE',
  ]
);

export type PaymentMethodType =

  typeof paymentMethodTypeEnum
    .enumValues[number];

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

export type OperationType =

  typeof operationTypeEnum
    .enumValues[number];

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

export type InstallmentStatus =

  typeof installmentStatusEnum
    .enumValues[number];

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

export type RecurrenceFrequency =

  typeof recurrenceFrequencyEnum
    .enumValues[number];