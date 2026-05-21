export function
isAutomaticPaymentMethod(
  methodType: string
) {

  return [
    'CREDIT_CARD',
    'AUTO_DEBIT',
  ].includes(
    methodType
  );
}