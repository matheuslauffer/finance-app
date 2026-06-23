export function
normalizeDueDay(
  value: number
) {

  if (
    Number.isNaN(value)
  ) {

    return 1;
  }

  return Math.min(
    31,
    Math.max(
      1,
      value
    )
  );
}

export function
normalizeWeekDay(
  value: number
) {

  if (
    Number.isNaN(value)
  ) {

    return 1;
  }

  return Math.min(
    6,
    Math.max(
      0,
      value
    )
  );
}

export function
getLastDayOfMonth(
  year: number,
  monthIndex: number
) {

  return new Date(
    year,
    monthIndex + 1,
    0
  ).getDate();
}

export function
getMonthlyDueDate({
  year,
  monthIndex,
  dueDay,
}: {
  year: number;

  monthIndex: number;

  dueDay: number;
}) {

  const normalizedDueDay =
    normalizeDueDay(
      dueDay
    );

  const day =
    Math.min(
      normalizedDueDay,
      getLastDayOfMonth(
        year,
        monthIndex
      )
    );

  return new Date(
    year,
    monthIndex,
    day
  );
}

export function
formatDateOnly(
  date: Date
) {

  return date
    .toISOString()
    .split('T')[0];
}

export function
getCurrentMonthDueDate(
  dueDay: number
) {

  const now =
    new Date();

  return getMonthlyDueDate({

    year:
      now.getFullYear(),

    monthIndex:
      now.getMonth(),

    dueDay,
  });
}

export function
getNextWeekdayDate({
  fromDate,
  weekDay,
}: {
  fromDate: Date;

  weekDay: number;
}) {

  const normalizedWeekDay =
    normalizeWeekDay(
      weekDay
    );

  const date =
    new Date(
      fromDate
    );

  const offset =
    (
      normalizedWeekDay
      -
      date.getDay()
      +
      7
    )
    % 7;

  date.setDate(
    date.getDate() + offset
  );

  return date;
}
