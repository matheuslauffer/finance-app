export function
isAutomaticPaymentMethod(
  methodType: string,

  requiresManualPayment = false
) {

  if (requiresManualPayment) {

    return false;
  }

  return [
    'AUTO_DEBIT',
  ].includes(
    methodType
  );
}
