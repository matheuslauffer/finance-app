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
  UserButton,
} from '@clerk/nextjs';


export default async function
DashboardPage() {

  const { userId } =
    await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const dashboard =
    await getCurrentDashboard(
      userId
    );

  return (

    <main className="p-10">

      <div className="
        flex
        justify-end
        mb-4
      ">
        <UserButton />
      </div>

      <h1 className="
        text-3xl
        font-bold
        mb-8
      ">
        Dashboard Financeiro
      </h1>

      <div className="
        grid
        grid-cols-2
        gap-4
      ">

        <div className="
          border
          p-4
          rounded-xl
        ">
          <h2>
            Receita Projetada
          </h2>

          <p className="
            text-2xl
            font-bold
          ">
            R$
            {
              dashboard
                ?.projectedIncome
            }
          </p>
        </div>

        <div className="
          border
          p-4
          rounded-xl
        ">
          <h2>
            Despesa Projetada
          </h2>

          <p className="
            text-2xl
            font-bold
          ">
            R$
            {
              dashboard
                ?.projectedExpense
            }
          </p>
        </div>

        <div className="
          border
          p-4
          rounded-xl
        ">
          <h2>
            Saldo Projetado
          </h2>

          <p className="
            text-2xl
            font-bold
          ">
            R$
            {
              dashboard
                ?.projectedBalance
            }
          </p>
        </div>

        <div className="
          border
          p-4
          rounded-xl
        ">
          <h2>
            Burn Rate
          </h2>

          <p className="
            text-2xl
            font-bold
          ">
            R$
            {
              dashboard
                ?.burnRate
            }
            /dia
          </p>
        </div>

      </div>

    </main>
  );
}