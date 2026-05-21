export function
getReferenceMonth(
  date: Date
) {

  return `${

    date.getFullYear()

  }-${
    String(
      date.getMonth() + 1
    ).padStart(2, '0')
  }`;
}