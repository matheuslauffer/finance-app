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

import {
  getFinancialReconciliation,
} from '@/services/financial-reconciliation-service';

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

    const reconciliation =
  await getFinancialReconciliation(

    userId,

    dashboard
      .recentMonths[0]
      .referenceMonth
      .slice(0, 7)
  );

  return (

    <main className="
      p-10
      space-y-8
      bg-[#f5f6f8]
      min-h-screen
    ">

      <div>

        <h1 className="
          text-4xl
          font-bold
          text-zinc-900
        ">
          Dashboard
        </h1>

        <p className="
          text-zinc-500
          mt-2
        ">
          Visão geral da sua vida financeira
        </p>

      </div>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      ">

        <div className="
          bg-white
          rounded-3xl
          border
          border-zinc-200
          p-6
          shadow-sm
        ">

          <p className="
            text-zinc-500
            text-sm
            mb-2
          ">
            Receita
          </p>

          <p className="
            text-4xl
            font-bold
            text-emerald-600
          ">
            R$
            {
              dashboard
                .projectedIncome
                .toFixed(2)
            }
          </p>

        </div>

        <div className="
          bg-white
          rounded-3xl
          border
          border-zinc-200
          p-6
          shadow-sm
        ">

          <p className="
            text-zinc-500
            text-sm
            mb-2
          ">
            Despesas
          </p>

          <p className="
            text-4xl
            font-bold
            text-red-500
          ">
            R$
            {
              dashboard
                .projectedExpense
                .toFixed(2)
            }
          </p>

        </div>

        <div className="
          bg-white
          rounded-3xl
          border
          border-zinc-200
          p-6
          shadow-sm
        ">

          <p className="
            text-zinc-500
            text-sm
            mb-2
          ">
            Saldo
          </p>

          <p
            className={`
              text-4xl
              font-bold

              ${
                dashboard
                  .projectedBalance >= 0
                  ? 'text-emerald-600'
                  : 'text-red-500'
              }
            `}
          >
            R$
            {
              dashboard
                .projectedBalance
                .toFixed(2)
            }
          </p>

        </div>

        <div className="
          bg-white
          rounded-3xl
          border
          border-zinc-200
          p-6
          shadow-sm
        ">

          <p className="
            text-zinc-500
            text-sm
            mb-2
          ">
            Comprometido
          </p>

          <p className="
            text-4xl
            font-bold
            text-zinc-900
          ">
            {
              dashboard
                .commitmentPercentage
                .toFixed(1)
            }%
          </p>

        </div>

      </div>

      <MonthlyOverviewChart
        data={
          dashboard.monthlyCashFlow
        }
      />

      <ExpensesByCategory
        data={
          dashboard
            .expensesByCategory
        }
      />

    </main>
  );
}