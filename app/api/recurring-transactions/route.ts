import {
  auth,
} from '@clerk/nextjs/server';

import {
  NextResponse,
} from 'next/server';

import {
  createRecurrence,
} from '@/services/create-recurrence-service';

import {
  updateRecurringTransaction,
} from '@/services/update-recurring-transaction-service';

import {
  formatDateOnly,
  getAnnualDueDate,
  getCurrentMonthDueDate,
  getNextWeekdayDate,
  normalizeDueDay,
  normalizeWeekDay,
} from '@/lib/recurrence-due-date';

export async function
POST(
  request: Request
) {

  const session =
    await auth();

  if (!session.userId) {

    return NextResponse.json(

      {
        error:
          'Unauthorized',
      },

      {
        status: 401,
      }
    );
  }

  const formData =
    await request.formData();

  const recurringTransactionId =
    formData.get(
      'recurringTransactionId'
    ) as string | null;

  const dueDay =
    normalizeDueDay(
      Number(
        formData.get(
          'dueDay'
        )
      )
    );

  const weekDay =
    normalizeWeekDay(
      Number(
        formData.get(
          'weekDay'
        )
      )
    );

  const annualMonth =
    normalizeDueDay(
      Number(
        formData.get(
          'annualMonth'
        )
      )
    );

  const frequency =
    formData.get(
      'frequency'
    ) as
      | 'DAILY'
      | 'WEEKLY'
      | 'BIWEEKLY'
      | 'MONTHLY'
      | 'YEARLY';

  const payload = {

    description:
      formData.get(
        'description'
      ) as string,

    amount:
      formData.get(
        'amount'
      ) as string,

    transactionType:
      formData.get(
        'transactionType'
      ) as
        | 'INCOME'
        | 'EXPENSE',

    frequency,

    categoryId:
      formData.get(
        'categoryId'
      ) as string,

    paymentMethodId:
      formData.get(
        'paymentMethodId'
      ) as string,

    dueDay,

    weekDay:
      frequency === 'WEEKLY'
        ? weekDay
        : null,

    nextOccurrence:
      frequency === 'WEEKLY'
        ? formatDateOnly(
            getNextWeekdayDate({

              fromDate:
                new Date(),

              weekDay,
            })
          )
        : frequency === 'YEARLY'
          ? formatDateOnly(
              getAnnualDueDate({

                month:
                  annualMonth,

                dueDay,
              })
            )
        : formatDateOnly(
            getCurrentMonthDueDate(
              dueDay
            )
        )
      ,

    endedAt:
      formData.get(
        'effectiveUntil'
      )?.toString().trim() || null,
  };

  /*
  UPDATE
  */

  if (
    recurringTransactionId
  ) {

    await updateRecurringTransaction({

      recurrenceId:
        recurringTransactionId,

      userId:
        session.userId,

      ...payload,
    });

    return NextResponse.redirect(

      new URL(
        '/recurring-transactions',
        request.url
      )
    );
  }

  /*
  CREATE
  */

  await createRecurrence({

    userId:
      session.userId,

    ...payload,
  });

  return NextResponse.redirect(

    new URL(
      '/recurring-transactions',
      request.url
    )
  );
}
