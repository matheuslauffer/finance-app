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
  invoiceDueDay,
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

  const purchaseDay =
    occurredAt.getDate();

  const goesToNextInvoice =

    invoiceClosingDay != null

    &&

    purchaseDay >= invoiceClosingDay;

  /*
  CREDIT CARD ALWAYS
  AFFECTS NEXT MONTH
  */

  const invoiceMonthOffset =
    goesToNextInvoice
      ? 2
      : 1;

  const competencyDate =
    new Date(

      occurredAt.getFullYear(),

      occurredAt.getMonth()
      + invoiceMonthOffset,

      invoiceDueDay ?? 1
    );


  return competencyDate

    .toISOString()

    .slice(0, 7);
}