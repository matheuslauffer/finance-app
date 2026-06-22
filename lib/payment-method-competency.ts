type Input = {

  occurredAt: Date;

  closingDay:
    number | null;

  dueDay:
    number | null;
};

export function
getFinancialCompetencyDate({
  occurredAt,
  closingDay,
  dueDay,
}: Input) {

  /*
  NON CREDIT CARD
  */

  if (
    !closingDay
    ||
    !dueDay
  ) {

    return occurredAt;
  }

  const purchaseDate =
  new Date(

    occurredAt.getUTCFullYear(),

    occurredAt.getUTCMonth(),

    occurredAt.getUTCDate(),
  );

  const purchaseDay =
    purchaseDate.getDate();

  let invoiceMonthOffset =
    1;

  if (
    purchaseDay > closingDay
  ) {

    invoiceMonthOffset = 2;
  }

  const competencyDate =
    new Date(

      purchaseDate.getFullYear(),

      purchaseDate.getMonth()
      + invoiceMonthOffset,

      dueDay,
    );

  return competencyDate;
}