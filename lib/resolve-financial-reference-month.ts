import {
  addMonths,
} from './date';

type Input = {

  occurredAt: Date;

  paymentMethodType:
    | 'DEBIT'
    | 'CREDIT_CARD'
    | 'PIX'
    | 'BANK_TRANSFER'
    | 'BOLETO'
    | 'CREDIT_LINE'
    | 'AUTO_DEBIT';

  invoiceClosingDay?: number;

  invoiceDueDay?: number;
};

export function
resolveFinancialReferenceMonth({
  occurredAt,
  paymentMethodType,
  invoiceClosingDay,
}: Input) {

  /*
  NON CREDIT CARD
  */

  if (
    paymentMethodType !== 'CREDIT_CARD'
  ) {

    return occurredAt

      .toISOString()

      .slice(0, 7);
  }

  /*
  CREDIT CARD
  */

  const purchaseDay =
    occurredAt.getDate();

  let referenceDate =
    new Date(occurredAt);

  /*
  PURCHASE AFTER CLOSING
  GOES TO NEXT INVOICE
  */

  if (
    invoiceClosingDay
    &&
    purchaseDay > invoiceClosingDay
  ) {

    referenceDate =
      addMonths(
        referenceDate,
        1
      );
  }

  return referenceDate

    .toISOString()

    .slice(0, 7);
}