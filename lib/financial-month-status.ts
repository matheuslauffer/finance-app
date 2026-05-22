export function
resolveFinancialMonthStatus(
  referenceMonth: string
) {

  const currentReferenceMonth =
    new Date()

      .toISOString()

      .slice(0, 7);

  return (
    referenceMonth
    <
    currentReferenceMonth
  )

    ? 'CLOSED'

    : 'FORECAST';
}