import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

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

export default async function
DashboardPage() {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

  const dashboard =
    await getCurrentDashboard(
      userId
    );

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
          Olá 👋
        </h1>

        <p className="
          text-zinc-500
          mt-2
        ">
          Aqui está o resumo da sua vida financeira
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

    {/* MAIN BALANCE */}

    <div className={`
      rounded-[2rem]
      p-8
      shadow-sm
      border

      ${
        dashboard.monthlyBalance >= 0

          ? `
            bg-emerald-500
            border-emerald-400
            text-white
          `

          : `
            bg-red-500
            border-red-400
            text-white
          `
      }
    `}>

      <p className="
        text-sm
        uppercase
        tracking-widest
        opacity-80
        mb-4
      ">
        Saldo do mês
      </p>

      <h2 className="
        text-6xl
        font-bold
      ">
        R$
        {
          dashboard.monthlyBalance
            .toFixed(2)
        }
      </h2>

      <div className="
        mt-8
        flex
        gap-8
        flex-wrap
      ">

        <div>

          <p className="
            text-sm
            opacity-80
          ">
            Receitas
          </p>

          <p className="
            text-2xl
            font-semibold
          ">
            R$
            {
              dashboard.projectedIncome
                .toFixed(2)
            }
          </p>

        </div>

        <div>

          <p className="
            text-sm
            opacity-80
          ">
            Despesas
          </p>

          <p className="
            text-2xl
            font-semibold
          ">
            R$
            {
              dashboard.projectedExpense
                .toFixed(2)
            }
          </p>

        </div>

      </div>

    </div>

    {/* WEEK + RECENTS */}

    <div className="
      grid
      grid-cols-1
      xl:grid-cols-2
      gap-6
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
            Contas da semana
          </h2>

          <p className="
            text-zinc-500
            mt-1
          ">
            Próximos pagamentos
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
                  Nenhuma despesa
                  prevista para esta semana
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
