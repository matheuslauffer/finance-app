export type ImportPayload = {
  description: string;

  amount: number;

  category: string;

  paymentMethod: string;

  transactionDate: string;

  installmentCount: number;

  installmentNumber: number;

  installmentAmount: number;

  dueDate: string | null;

  isRecurring: boolean;
};