export function
getPreviousReferenceMonth(
  referenceMonth: string
) {

  const [
    year,
    month,
  ] =
    referenceMonth
      .split('-')
      .map(Number);

  const date =
    new Date(
      year,
      month - 2,
      1
    );

  return `${

    date.getFullYear()

  }-${

    String(
      date.getMonth() + 1
    ).padStart(2, '0')

  }`;
}

export function
getNextReferenceMonth(
  referenceMonth: string
) {

  const [
    year,
    month,
  ] =
    referenceMonth
      .split('-')
      .map(Number);

  const date =
    new Date(
      year,
      month,
      1
    );

  return `${

    date.getFullYear()

  }-${

    String(
      date.getMonth() + 1
    ).padStart(2, '0')

  }`;
}