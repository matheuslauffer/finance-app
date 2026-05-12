export function getFinancialMonthDate(
  occurredAt: Date,
  closingDay?: number | null
) {

  const result =
    new Date(occurredAt);

  // Crédito após fechamento
  // cai no próximo mês

  if (
    closingDay &&
    occurredAt.getDate() >
      closingDay
  ) {

    result.setMonth(
      result.getMonth() + 1
    );
  }

  return new Date(
    result.getFullYear(),
    result.getMonth(),
    1
  );
}