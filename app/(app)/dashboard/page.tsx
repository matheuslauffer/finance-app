import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import {
  SearchParams,
} from 'next/dist/server/request/search-params';

import {
  getCurrentDashboard,
} from '@/services/dashboard-service';

import {
  MonthlyOverviewChart,
} from '../../components/monthly-overview-chart';

import {
  ExpensesByCategory,
} from '../../components/expenses-by-category';

import Link from 'next/link';

type Props = {
  searchParams: Promise<{
    pendingPage?: string;
  }>;
};

export default async function
DashboardPage({
  searchParams,
}: Props) {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

  const {
    pendingPage,
  } = await searchParams;

  const dashboard =
    await getCurrentDashboard(
      userId,
      {
        pendingPage:
          Number(pendingPage || '1'),
      }
    );

  const today =
    new Date()
      .toISOString()
      .split('T')[0];

  function formatCurrency(
    value: number
  ) {

    return new Intl.NumberFormat(
      'pt-BR',
      {
        style:
          'currency',

        currency:
          'BRL',
      }
    ).format(value);
  }

  return (

  <main className="
    p-10
    space-y-8
    bg-[#f5f6f8]
    min-h-screen
  ">

    {/* HEADER */}

    <div className="
      flex
      items-center
      justify-between
      gap-6
      flex-wrap
    ">

      <div>

        <h1 className="
          text-4xl
          font-bold
          text-zinc-900
        ">
          Painel financeiro
        </h1>

        <p className="
          text-zinc-500
          mt-2
        ">
          Pendências, pagamentos e lançamentos recentes
        </p>

      </div>

      <Link
        href="/transactions/new"

        className="
          hidden
          md:flex
          bg-zinc-900
          text-white
          px-6
          py-4
          rounded-2xl
          font-semibold
          hover:bg-zinc-800
          transition
          shadow-sm
        "
      >
        + Nova transação
      </Link>

    </div>

    {/* OPERATIONAL SUMMARY */}

    <div className="
      grid
      grid-cols-1
      sm:grid-cols-2
      xl:grid-cols-4
      gap-4
    ">

      <div className="
        bg-white
        border
        border-zinc-200
        rounded-2xl
        p-5
        shadow-sm
      ">

        <p className="
          text-sm
          font-medium
          text-zinc-500
        ">
          Pendente
        </p>

        <p className="
          mt-2
          text-2xl
          font-bold
          text-zinc-900
        ">
          {
            formatCurrency(
              dashboard
                .operationalSummary
                .pendingAmount
            )
          }
        </p>

        <p className="
          mt-1
          text-xs
          text-zinc-500
        ">
          {
            dashboard
              .operationalSummary
              .pendingCount
          } contas em aberto
        </p>

      </div>

      <div className="
        bg-white
        border
        border-red-100
        rounded-2xl
        p-5
        shadow-sm
      ">

        <p className="
          text-sm
          font-medium
          text-red-500
        ">
          Atrasado
        </p>

        <p className="
          mt-2
          text-2xl
          font-bold
          text-red-600
        ">
          {
            formatCurrency(
              dashboard
                .operationalSummary
                .overdueAmount
            )
          }
        </p>

        <p className="
          mt-1
          text-xs
          text-zinc-500
        ">
          {
            dashboard
              .operationalSummary
              .overdueCount
          } contas vencidas
        </p>

      </div>

      <div className="
        bg-white
        border
        border-zinc-200
        rounded-2xl
        p-5
        shadow-sm
      ">

        <p className="
          text-sm
          font-medium
          text-zinc-500
        ">
          Pago no mês
        </p>

        <p className="
          mt-2
          text-2xl
          font-bold
          text-emerald-600
        ">
          {
            formatCurrency(
              dashboard
                .operationalSummary
                .paidThisMonth
            )
          }
        </p>

        <p className="
          mt-1
          text-xs
          text-zinc-500
        ">
          Despesas confirmadas
        </p>

      </div>

      <div className="
        bg-white
        border
        border-zinc-200
        rounded-2xl
        p-5
        shadow-sm
      ">

        <p className="
          text-sm
          font-medium
          text-zinc-500
        ">
          Previsto no mês
        </p>

        <p className="
          mt-2
          text-2xl
          font-bold
          text-zinc-900
        ">
          {
            formatCurrency(
              dashboard
                .operationalSummary
                .expectedThisMonth
            )
          }
        </p>

        <p className="
          mt-1
          text-xs
          text-zinc-500
        ">
          Projeção de despesas
        </p>

      </div>

    </div>

    {/* WEEK + RECENTS */}

    <div className="
      grid
      grid-cols-1
      xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]
      gap-6
      items-start
    ">

      {/* WEEKLY EXPENSES */}

      <div className="
        bg-white
        rounded-3xl
        border
        border-zinc-200
        p-6
        shadow-sm
      ">

        <div className="
          mb-6
        ">

          <h2 className="
            text-2xl
            font-bold
            text-zinc-900
          ">
            Contas pendentes
          </h2>

          <p className="
            text-zinc-500
            mt-1
          ">
            Atrasadas e previstas até o mês atual
          </p>

        </div>

        <div className="
          space-y-4
        ">

          {
            dashboard.weeklyExpenses
              .length === 0

              ? (

                <p className="
                  text-zinc-500
                ">
                  Nenhuma recorrência
                  pendente até este mês
                </p>
              )

              : (

                dashboard.weeklyExpenses.map(
                  (expense) => (

                    <div
                      key={expense.id}

                      className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-zinc-100
                        pb-4
                        last:border-b-0
                        last:pb-0
                      "
                    >

                      <div>

                        <p className="
                          font-semibold
                          text-zinc-900
                        ">
                          {
                            expense.description
                          }
                        </p>

                        <p className="
                          text-sm
                          text-zinc-500
                          mt-1
                        ">
                          {
                            expense.paymentMethodName
                          }
                        </p>

                        <div className="
                          mt-2
                          flex
                          flex-wrap
                          gap-2
                        ">

                          <span className="
                            rounded-full
                            bg-zinc-100
                            px-2
                            py-1
                            text-xs
                            font-medium
                            text-zinc-600
                          ">
                            {expense.referenceMonth}
                          </span>

                          {
                            expense.referenceMonth
                            < dashboard.currentMonth.referenceMonth
                            && (

                              <span className="
                                rounded-full
                                bg-red-100
                                px-2
                                py-1
                                text-xs
                                font-medium
                                text-red-700
                              ">
                                Atrasada
                              </span>
                            )
                          }

                        </div>

                        <form
                          action="/api/recurring-transactions/pay"

                          method="POST"

                          encType="multipart/form-data"

                          className="
                            mt-3
                            flex
                            flex-wrap
                            items-end
                            gap-3
                          "
                        >

                          <input
                            type="hidden"

                            name="recurringTransactionId"

                            value={
                              expense.recurringTransactionId
                            }
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
                              px-3
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
                          action={`/api/recurring-transactions/${expense.recurringTransactionId}/cancel`}
                          method="POST"
                          className="mt-3"
                        >
                          <button
                            type="submit"
                            className="
                              px-3
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

                        <details className="
                          mt-3
                          text-sm
                        ">

                          <summary className="
                            cursor-pointer
                            font-medium
                            text-zinc-600
                            hover:text-zinc-900
                          ">
                            Editar
                          </summary>

                          <form
                            action={`/api/recurring-transactions/${expense.recurringTransactionId}/edit`}

                            method="POST"

                            encType="multipart/form-data"

                            className="
                              mt-3
                              grid
                              gap-3
                              sm:grid-cols-3
                              max-w-xl
                            "
                          >

                            <label className="
                              grid
                              gap-1
                            ">
                              <span className="
                                text-xs
                                font-medium
                                text-zinc-500
                              ">
                                Valor
                              </span>

                              <input
                                type="number"

                                name="projectedAmount"

                                min="0"

                                step="0.01"

                                defaultValue={
                                  expense.amount
                                    .toFixed(2)
                                }

                                className="
                                  rounded-xl
                                  border
                                  border-zinc-300
                                  px-3
                                  py-2
                                  text-zinc-900
                                "
                              />
                            </label>

                            <label className="
                              grid
                              gap-1
                            ">
                              <span className="
                                text-xs
                                font-medium
                                text-zinc-500
                              ">
                                Vencimento
                              </span>

                              <input
                                type="date"

                                name="dueDate"

                                defaultValue={
                                  expense.effectiveDate
                                }

                                className="
                                  rounded-xl
                                  border
                                  border-zinc-300
                                  px-3
                                  py-2
                                  text-zinc-900
                                "
                              />
                            </label>

                            <label className="
                              grid
                              gap-1
                            ">
                              <span className="
                                text-xs
                                font-medium
                                text-zinc-500
                              ">
                                Método
                              </span>

                              <select
                                name="paymentMethodId"

                                defaultValue={
                                  expense.paymentMethodId
                                }

                                className="
                                  rounded-xl
                                  border
                                  border-zinc-300
                                  px-3
                                  py-2
                                  text-zinc-900
                                "
                              >
                                {
                                  dashboard.paymentMethods.map(
                                    (method) => (

                                      <option
                                        key={method.id}

                                        value={method.id}
                                      >
                                        {method.name}
                                      </option>
                                    )
                                  )
                                }
                              </select>
                            </label>

                            <button
                              type="submit"

                              className="
                                sm:col-span-3
                                justify-self-start
                                rounded-xl
                                border
                                border-zinc-300
                                px-3
                                py-2
                                text-sm
                                font-medium
                                text-zinc-800
                                hover:bg-zinc-50
                                transition
                              "
                            >
                              Salvar alterações
                            </button>

                          </form>

                        </details>

                      </div>

                      <div className="
                        text-right
                      ">

                        <p className="
                          font-bold
                          text-red-500
                        ">
                          R$
                          {
                            expense.amount
                              .toFixed(2)
                          }
                        </p>

                        <p className="
                          text-sm
                          text-zinc-500
                          mt-1
                        ">
                          {
                            expense.effectiveDate
                          }
                        </p>

                      </div>

                    </div>
                  )
                )
              )
          }

        </div>

        {
          (
            dashboard.pendingPage > 1
            ||
            dashboard.hasMorePending
          )
          && (

            <div className="
              flex
              items-center
              justify-between
              mt-6
              pt-4
              border-t
              border-zinc-100
            ">

              <div>

                {
                  dashboard.pendingPage > 1
                  && (

                    <Link
                      href={`/dashboard?pendingPage=${Math.max(1, dashboard.pendingPage - 1)}`}
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
                Página {dashboard.pendingPage}
              </span>

              <div>

                {
                  dashboard.hasMorePending
                  && (

                    <Link
                      href={`/dashboard?pendingPage=${dashboard.pendingPage + 1}`}
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

      {/* RECENT TRANSACTIONS */}

      <div className="
        bg-white
        rounded-3xl
        border
        border-zinc-200
        p-6
        shadow-sm
      ">

        <div className="
          mb-6
        ">

          <h2 className="
            text-2xl
            font-bold
            text-zinc-900
          ">
            Últimos lançamentos
          </h2>

          <p className="
            text-zinc-500
            mt-1
          ">
            Movimentações recentes
          </p>

        </div>

        <div className="
          space-y-4
        ">

          {
            dashboard.recentTransactions.map(
              (transaction) => (

                <div
                  key={transaction.id}

                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-zinc-100
                    pb-4
                    last:border-b-0
                    last:pb-0
                  "
                >

                  <div>

                    <p className="
                      font-semibold
                      text-zinc-900
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
                        transaction.createdAt
                          .toLocaleDateString(
                            'pt-BR'
                          )
                      }
                    </p>

                  </div>

                  <p className={`
                    font-bold

                    ${
                      transaction.transactionType
                      === 'INCOME'

                        ? `
                          text-emerald-600
                        `

                        : `
                          text-red-500
                        `
                    }
                  `}>

                    {
                      transaction.transactionType
                      === 'INCOME'

                        ? '+ '

                        : '- '
                    }

                    R$
                    {
                      transaction.amount
                        .toFixed(2)
                    }

                  </p>

                </div>
              )
            )
          }

        </div>

      </div>

    </div>

    {/* ANALYTICS */}

    <MonthlyOverviewChart
      data={
        dashboard.monthlyCashFlow
      }
    />

    <ExpensesByCategory
      data={
        dashboard.expensesByCategory
      }
      title="Categorias que mais pesaram"
      subtitle="Despesas confirmadas no mês atual"
      emptyMessage="Nenhuma despesa confirmada neste mês"
    />

    <Link
      href="/transactions/new"

      className="
        md:hidden

        fixed
        bottom-6
        right-6

        w-16
        h-16

        rounded-full

        bg-zinc-900
        text-white

        flex
        items-center
        justify-center

        text-3xl
        font-light

        shadow-lg
        hover:scale-105
        active:scale-95

        transition-all
        duration-200

        z-50
      "
    >
      +
    </Link>

  </main>
);
}
