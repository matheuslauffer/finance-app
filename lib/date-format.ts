export function
formatDate(
  date: string | Date
) {

  return new Intl
    .DateTimeFormat(
      'pt-BR'
    )
    .format(
      new Date(date)
    );
}