import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import Link from 'next/link';

import {
  getProjectionMonth,
} from '@/services/projection-service';

import {
  getPreviousReferenceMonth,
  getNextReferenceMonth,
} from '@/lib/reference-month-navigation';

import {
  formatCurrency,
} from '@/lib/currency';

type Props = {

  params: Promise<{
    referenceMonth: string;
  }>;

  searchParams: Promise<{

    recurringPage?: string;

    transactionsPage?: string;
  }>;
};

export default async function
ProjectionMonthPage({
  params,
  searchParams,
}: Props) {

  const session =
    await auth();

  if (!session.userId) {

    redirect('/sign-in');
  }

  const {
    referenceMonth,
  } = await params;

  const {
    recurringPage,
    transactionsPage,
  } = await searchParams;

  const recurringCurrentPage =
    Number(recurringPage || '1');

  const transactionsCurrentPage =
    Number(transactionsPage || '1');

  const projection =
    await getProjectionMonth({

      recurringPage:
        recurringCurrentPage,

      transactionsPage:
        transactionsCurrentPage,

      userId:
        session.userId,

      referenceMonth,
    });

  if (!projection) {

    return (

      <main className="
        p-10
      ">

        <h1 className="
          text-2xl
          font-bold
        ">
          Mês não encontrado
        </h1>

      </main>
    );
  }

  const {
    financialMonth,
    recurringSnapshots,
    realizedTransactions,
    hasMoreRecurring,
    hasMoreTransactions,
  } = projection;

  const previousMonth =
    getPreviousReferenceMonth(
      referenceMonth
    );

  const nextMonth =
    getNextReferenceMonth(
      referenceMonth
    );

  return (

    <main className="
      p-10
      bg-[#f5f6f8]
      min-h-screen
      space-y-8
    ">

      {/* HEADER */}

      <div className="
        flex
        flex-col
        gap-4
      ">

        <div className="
          flex
          items-center
          justify-between
          flex-wrap
          gap-4
        ">

          <div>

            <h1 className="
              text-4xl
              font-bold
              text-zinc-900
            ">
              Projeção {referenceMonth}
            </h1>

            <p className="
              text-zinc-500
              mt-2
            ">
              Visão financeira projetada
            </p>

          </div>

          <span
            className={`
              inline-flex
              items-center
              px-4
              py-2
              rounded-full
              text-xs
              font-bold

              ${
                financialMonth.status
                === 'CLOSED'

                  ? `
                    bg-zinc-900
                    text-white
                  `

                  : financialMonth.status
                  === 'OPEN'

                    ? `
                      bg-emerald-100
                      text-emerald-700
                    `

                    : `
                      bg-amber-100
                      text-amber-700
                    `
              }
            `}
          >
            {financialMonth.status}
          </span>

        </div>

        {/* NAVIGATION */}

        <div className="
          flex
          items-center
          gap-3
          flex-wrap
        ">

          <Link
            href={`/projections/${previousMonth}`}

            className="
                px-4
                py-2
                rounded-2xl
                border
                border-zinc-300
                bg-white
                hover:bg-zinc-50
                transition
                text-sm
                font-medium
                text-zinc-800
                hover:text-zinc-950
            "
            >
            ← {previousMonth}
            </Link>

            <Link
            href={`/projections/${nextMonth}`}

            className="
                px-4
                py-2
                rounded-2xl
                border
                border-zinc-300
                bg-white
                hover:bg-zinc-50
                transition
                text-sm
                font-medium
                text-zinc-800
                hover:text-zinc-950
            "
            >
            {nextMonth} →
            </Link>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-4
        gap-4
      ">

        <div className="
          bg-white
          rounded-3xl
          p-6
          border
          border-zinc-200
        ">

          <p className="
            text-sm
            text-zinc-500
          ">
            Receita Projetada
          </p>

          <h2 className="
            text-2xl
            font-bold
            mt-2
            text-emerald-600
          ">
            {
              formatCurrency(
                Number(
                  financialMonth.projectedIncome
                )
              )
            }
          </h2>

        </div>

        <div className="
          bg-white
          rounded-3xl
          p-6
          border
          border-zinc-200
        ">

          <p className="
            text-sm
            text-zinc-500
          ">
            Despesa Projetada
          </p>

          <h2 className="
            text-2xl
            font-bold
            mt-2
            text-red-600
          ">
            {
              formatCurrency(
                Number(
                  financialMonth.projectedExpense
                )
              )
            }
          </h2>

        </div>

        <div className="
          bg-white
          rounded-3xl
          p-6
          border
          border-zinc-200
        ">

          <p className="
            text-sm
            text-zinc-500
          ">
            Saldo Projetado
          </p>

          <h2 className="
            text-2xl
            font-bold
            mt-2
            text-zinc-900
          ">
            {
              formatCurrency(
                Number(
                  financialMonth.projectedBalance
                )
              )
            }
          </h2>

        </div>

        <div className="
          bg-white
          rounded-3xl
          p-6
          border
          border-zinc-200
        ">

          <p className="
            text-sm
            text-zinc-500
          ">
            Comprometido
          </p>

          <h2 className="
            text-2xl
            font-bold
            mt-2
            text-amber-600
          ">
            {
              formatCurrency(
                Number(
                  financialMonth.committedAmount
                )
              )
            }
          </h2>

        </div>

      </div>

      {/* CONTENT */}

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      ">

        {/* RECURRENCES */}

        <div className="
          bg-white
          rounded-3xl
          border
          border-zinc-200
          p-6
        ">

          <h2 className="
            text-xl
            font-bold
            mb-4
            text-zinc-900
          ">
            Recorrências
          </h2>

          <div className="
            space-y-3
            max-h-[600px]
            overflow-y-auto
            pr-2
          ">

            {
              recurringSnapshots.map(
                (item) => (

                  <div
                    key={item.id}

                    className="
                      flex
                      items-center
                      justify-between
                      border
                      border-zinc-200
                      rounded-2xl
                      p-4
                      bg-white
                    "
                  >

                    <div>

                      <p className="
                        font-medium
                        text-zinc-800
                        flex
                        items-center
                        gap-2
                      ">

                        <span>
                          {item.description}
                        </span>

                        <span>
                          {
                            item.status === 'FULFILLED'
                              ? '✅'
                              : '🕒'
                          }
                        </span>

                      </p>

                      <p className="
                        text-sm
                        text-zinc-500
                        mt-1
                      ">
                        {item.dueDate}
                      </p>

                      {
                        item.status === 'PROJECTED'
                        &&
                        item.transactionType === 'EXPENSE'
                        && (

                          <form
                            action="/api/recurring-transactions/pay"

                            method="POST"

                            encType="multipart/form-data"

                            className="mt-3"
                          >

                            <input
                              type="hidden"

                              name="recurringTransactionId"

                              value={item.id}
                            />

                            <button
                              type="submit"

                              className="
                                px-4
                                py-2
                                rounded-xl
                                bg-zinc-900
                                text-white
                                text-sm
                                font-medium
                                hover:bg-zinc-800
                                transition
                              "
                            >
                              Pagar
                            </button>

                          </form>
                        )
                      }

                    </div>

                    <p
                      className={`
                        font-bold
                        text-lg

                        ${
                          item.transactionType === 'INCOME'
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }
                      `}
                    >
                      {
                        formatCurrency(
                          Number(
                            item.projectedAmount
                          )
                        )
                      }
                    </p>

                  </div>
                )
              )
            }

          </div>

          {
            (
              recurringCurrentPage > 1
              ||
              hasMoreRecurring
            )
            && (

              <div className="
                flex
                items-center
                justify-between
                mt-6
              ">

                <div>

                  {
                    recurringCurrentPage > 1
                    && (

                      <Link
                        scroll={false}

                        href={`/projections/${referenceMonth}?recurringPage=${Math.max(1, recurringCurrentPage - 1)}&transactionsPage=${transactionsCurrentPage}`}

                        className="
                          text-sm
                          font-medium
                          text-zinc-600
                          hover:text-zinc-900
                        "
                      >
                        ← Anterior
                      </Link>
                    )
                  }

                </div>

                <span className="
                  text-sm
                  text-zinc-500
                ">
                  Página {recurringCurrentPage}
                </span>

                <div>

                  {
                    hasMoreRecurring
                    && (

                      <Link
                        scroll={false}

                        href={`/projections/${referenceMonth}?recurringPage=${recurringCurrentPage + 1}&transactionsPage=${transactionsCurrentPage}`}

                        className="
                          text-sm
                          font-medium
                          text-zinc-600
                          hover:text-zinc-900
                        "
                      >
                        Próxima →
                      </Link>
                    )
                  }

                </div>

              </div>
            )
          }

        </div>

        {/* REALIZED */}

        <div className="
          bg-white
          rounded-3xl
          border
          border-zinc-200
          p-6
        ">

          <h2 className="
            text-xl
            font-bold
            mb-4
            text-zinc-900
          ">
            Transações Realizadas
          </h2>

          <div className="
            space-y-3
            max-h-[600px]
            overflow-y-auto
            pr-2
          ">

            {
              realizedTransactions.map(
                (transaction) => (

                  <div
                    key={transaction.id}

                    className="
                      flex
                      items-center
                      justify-between
                      border
                      border-zinc-200
                      rounded-2xl
                      p-4
                      bg-white
                    "
                  >

                    <div>

                      <p className="
                        font-medium
                        text-zinc-800
                      ">
                        {
                          transaction.description
                        }
                      </p>

                      <p className="
                        text-sm
                        text-zinc-500
                        mt-1
                      ">
                        {
                          transaction.effectiveDate
                        }
                      </p>

                    </div>

                    <p
                      className={`
                        font-bold
                        text-lg

                        ${
                          transaction.transactionType
                          === 'INCOME'

                            ? 'text-emerald-600'

                            : 'text-red-600'
                        }
                      `}
                    >
                      {
                        formatCurrency(
                          Number(
                            transaction.amount
                          )
                        )
                      }
                    </p>

                  </div>
                )
              )
            }

          </div>

          {
            (
              transactionsCurrentPage > 1
              ||
              hasMoreTransactions
            )
            && (

              <div className="
                flex
                items-center
                justify-between
                mt-6
              ">

                <div>

                  {
                    transactionsCurrentPage > 1
                    && (

                      <Link
                        href={`/projections/${referenceMonth}?recurringPage=${recurringCurrentPage}&transactionsPage=${Math.max(1, transactionsCurrentPage - 1)}`}
                        scroll={false}

                        className="
                          text-sm
                          font-medium
                          text-zinc-600
                          hover:text-zinc-900
                        "
                      >
                        ← Anterior
                      </Link>
                    )
                  }

                </div>

                <span className="
                  text-sm
                  text-zinc-500
                ">
                  Página {transactionsCurrentPage}
                </span>

                <div>

                  {
                    hasMoreTransactions
                    && (

                      <Link
                      scroll={false}
                        href={`/projections/${referenceMonth}?recurringPage=${recurringCurrentPage}&transactionsPage=${transactionsCurrentPage + 1}`}

                        className="
                          text-sm
                          font-medium
                          text-zinc-600
                          hover:text-zinc-900
                        "
                      >
                        Próxima →
                      </Link>
                    )
                  }

                </div>

              </div>
            )
          }

        </div>

      </div>

    </main>
  );
}