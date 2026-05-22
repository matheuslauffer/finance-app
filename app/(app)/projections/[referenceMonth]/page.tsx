import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import {
  getProjectionMonth,
} from '@/services/projection-service';

type Props = {

  params: Promise<{
    referenceMonth: string;
  }>;
};

export default async function
ProjectionMonthPage({
  params,
}: Props) {

  const session =
    await auth();

  if (!session.userId) {

    redirect('/sign-in');
  }

  const {
    referenceMonth,
  } = await params;

  const projection =
    await getProjectionMonth({

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
  } = projection;

  return (

    <main className="
      p-10
      bg-[#f5f6f8]
      min-h-screen
      space-y-8
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
            R$ {
              Number(
                financialMonth.projectedIncome
              ).toLocaleString(
                'pt-BR'
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
            R$ {
              Number(
                financialMonth.projectedExpense
              ).toLocaleString(
                'pt-BR'
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
            R$ {
              Number(
                financialMonth.projectedBalance
              ).toLocaleString(
                'pt-BR'
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
            R$ {
              Number(
                financialMonth.committedAmount
              ).toLocaleString(
                'pt-BR'
              )
            }
          </h2>

        </div>

      </div>

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      ">

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
          ">
            Recorrências
          </h2>

          <div className="
            space-y-3
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
                      border-zinc-100
                      rounded-2xl
                      p-4
                    "
                  >

                    <div>

                      <p className="
                        font-medium
                      ">
                        {item.status}
                      </p>

                      <p className="
                        text-sm
                        text-zinc-500
                      ">
                        {item.dueDate}
                      </p>

                    </div>

                    <p className="
                      font-bold
                    ">
                      R$ {
                        Number(
                          item.projectedAmount
                        ).toLocaleString(
                          'pt-BR'
                        )
                      }
                    </p>

                  </div>
                )
              )
            }

          </div>

        </div>

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
          ">
            Transações Realizadas
          </h2>

          <div className="
            space-y-3
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
                      border-zinc-100
                      rounded-2xl
                      p-4
                    "
                  >

                    <div>

                      <p className="
                        font-medium
                      ">
                        {
                          transaction.description
                        }
                      </p>

                      <p className="
                        text-sm
                        text-zinc-500
                      ">
                        {
                          transaction.effectiveDate
                        }
                      </p>

                    </div>

                    <p className="
                      font-bold
                    ">
                      R$ {
                        Number(
                          transaction.amount
                        ).toLocaleString(
                          'pt-BR'
                        )
                      }
                    </p>

                  </div>
                )
              )
            }

          </div>

        </div>

      </div>

    </main>
  );
}