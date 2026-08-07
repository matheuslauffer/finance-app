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

import {
  ExpensesByCategory,
} from '@/app/components/expenses-by-category';

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
          text-lg
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
    expensesByCategory,
  } = projection;

  const previousMonth =
    getPreviousReferenceMonth(
      referenceMonth
    );

  const nextMonth =
    getNextReferenceMonth(
      referenceMonth
    );

  const today =
    new Date()
      .toISOString()
      .split('T')[0];

  function
  getStatusLabel(
    status: string
  ) {

    switch (status) {

      case 'FULFILLED':
        return 'Pago';

      case 'CANCELLED':
        return 'Cancelado';

      default:
        return 'Previsto';
    }
  }

  function
  getStatusIcon(
    status: string
  ) {

    switch (status) {

      case 'FULFILLED':
        return '✅';

      case 'CANCELLED':
        return '❌';

      default:
        return '🕒';
    }
  }

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
              Planejamento {referenceMonth}
            </h1>

            <p className="
              text-zinc-500
              mt-2
            ">
              Seus compromissos e projeções financeiras
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
        grid-cols-2
        lg:grid-cols-4
        gap-3
      ">

        <div className="
          bg-white
          rounded-3xl
          p-4
          border
          border-zinc-200
        ">

          <p className="
            text-sm
            text-zinc-500
          ">
            Receitas Esperadas
          </p>

          <h2 className="
            text-lg
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
          p-4
          border
          border-zinc-200
        ">

          <p className="
            text-sm
            text-zinc-500
          ">
            Despesas Previstas
          </p>

          <h2 className="
            text-lg
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
          p-4
          border
          border-zinc-200
        ">

          <p className="
            text-sm
            text-zinc-500
          ">
            Saldo Estimado
          </p>

          <h2 className="
            text-lg
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
          p-4
          border
          border-zinc-200
        ">

          <p className="
            text-sm
            text-zinc-500
          ">
            Já Comprometido
          </p>

          <h2 className="
            text-lg
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

      {/* ExpensesByCategory moved to page end */}

      {/* CONTENT */}

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-4
      ">

        {/* COMMITMENTS */}

        <div className="
          bg-white
          rounded-3xl
          border
          border-zinc-200
          p-4
        ">

          <div className="mb-6">

            <h2 className="
              text-xl
              font-bold
              text-zinc-900
            ">
              Compromissos do mês
            </h2>

            <p className="
              text-sm
              text-zinc-500
              mt-2
            ">
              Contas previstas ainda não pagas
            </p>

          </div>

          <div className="
            space-y-3
            max-h-none
            overflow-y-visible
            pr-0
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
                      hover:border-zinc-400
                      hover:shadow-sm
                      transition-all
                    "
                  >

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/recurring-transactions/${item.id}`}
                        className="
                          block
                          min-w-0
                        "
                      >
                        <div className="
                          flex
                          items-center
                          gap-2
                        ">

                          <p className="
                            font-medium
                            text-zinc-800
                          ">
                            {item.description}
                          </p>

                          <span>
                            {
                              getStatusIcon(
                                item.status
                              )
                            }
                          </span>

                        </div>

                        <div className="
                          flex
                          items-center
                          gap-2
                          mt-2
                          flex-wrap
                        ">

                          <p className="
                            text-sm
                            text-zinc-500
                          ">
                            {item.dueDate}
                          </p>

                          <span className="
                            text-zinc-300
                          ">
                            •
                          </span>

                          <p className="
                            text-sm
                            text-zinc-500
                          ">
                            {
                              getStatusLabel(
                                item.status
                              )
                            }
                          </p>

                        </div>
                      </Link>

                      {
                        item.status === 'PROJECTED'
                        &&
                        item.transactionType === 'EXPENSE'
                        && (

                          <div className="mt-4 space-y-2">
                            <form
                              action="/api/recurring-transactions/pay"
                              method="POST"
                              encType="multipart/form-data"
                              className="
                                flex
                                flex-wrap
                                items-end
                                gap-3
                              "
                            >

                              <input
                                type="hidden"
                                name="recurringTransactionId"
                                value={item.id}
                              />

                              <label className="
                                grid
                                gap-1
                              ">
                                <span className="
                                  text-xs
                                  font-medium
                                  text-zinc-500
                                ">
                                  Pago em
                                </span>

                                <input
                                  type="date"
                                  name="paidAt"
                                  defaultValue={today}
                                  className="
                                    rounded-xl
                                    border
                                    border-zinc-300
                                    px-3
                                    py-2
                                    text-sm
                                    text-zinc-900
                                  "
                                />
                              </label>

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
                                Marcar como pago
                              </button>

                            </form>

                            <form
                              action={`/api/recurring-transactions/${item.id}/cancel`}
                              method="POST"
                              className="mt-2"
                            >
                              <button
                                type="submit"
                                className="
                                  px-4
                                  py-2
                                  rounded-xl
                                  bg-red-100
                                  text-red-700
                                  text-sm
                                  font-medium
                                  hover:bg-red-200
                                  transition
                                "
                              >
                                Cancelar ocorrência
                              </button>
                            </form>
                          </div>
                        )
                      }

                    </div>

                    <p
                      className={`
                        font-bold
                        text-lg
                        ml-4

                        ${
                          item.transactionType
                          === 'INCOME'

                            ? 'text-emerald-600'

                            : 'text-red-600'
                        }
                      `}
                    >
                      {
                        formatCurrency(
                          Number(
                            item.projectedAmount
                            ?? '0'
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

        {/* LAST PAYMENTS */}

        <div className="
          bg-white
          rounded-3xl
          border
          border-zinc-200
          p-4
        ">

          <div className="mb-6">

            <h2 className="
              text-xl
              font-bold
              text-zinc-900
            ">
              Últimos pagamentos
            </h2>

            <p className="
              text-sm
              text-zinc-500
              mt-2
            ">
              Compromissos confirmados recentemente
            </p>

          </div>

          <div className="
            space-y-3
            max-h-none
            overflow-y-visible
            pr-0
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

      </div>

      {/* Expenses by category placed at page end */}

      <ExpensesByCategory
        data={expensesByCategory}
        title="Despesas previstas por categoria"
        subtitle="Pagas e pendentes neste mês projetado"
        emptyMessage="Nenhuma despesa prevista para este mês"
      />

    </main>
  );
}
