export function calculateInstallmentAmount(
  totalAmount: number,
  installmentCount: number
) {
  return Number(
    (
      totalAmount / installmentCount
    ).toFixed(2)
  );
}