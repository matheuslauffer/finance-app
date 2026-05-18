import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import Link from 'next/link';

import {
  getRecurringTransactions,
} from '@/services/recurring-transactions-service';

export default async function
RecurringTransactionsPage() {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

  const recurring =
    await getRecurringTransactions(
      userId
    );

  return (

    <main className="
      p-10
      bg-[#f5f6f8]
      min-h-screen
    ">

      <div className="
        flex
        items-center
        justify-between
        mb-8
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
            text-zinc-900
          ">
            Recorrências
          </h1>

          <p className="
            text-zinc-500
            mt-2
          ">
            Gerencie seus compromissos financeiros
          </p>

        </div>

        <Link
          href="
            /recurring-transactions/new
          "

          className="
            bg-zinc-900
            text-white
            px-5
            py-3
            rounded-2xl
            hover:bg-zinc-800
            transition
            font-medium
          "
        >
          Nova recorrência
        </Link>

      </div>

      <div className="
        bg-white
        border
        border-zinc-200
        rounded-3xl
        overflow-hidden
        shadow-sm
      ">

        <table className="
          w-full
        ">

          <thead className="
            bg-zinc-50
            border-b
            border-zinc-200
          ">

            <tr>

              <th className="
                text-left
                p-5
                text-sm
                font-semibold
                text-zinc-600
              ">
                Descrição
              </th>

              <th className="
                text-left
                p-5
                text-sm
                font-semibold
                text-zinc-600
              ">
                Frequência
              </th>

              <th className="
                text-left
                p-5
                text-sm
                font-semibold
                text-zinc-600
              ">
                Valor
              </th>

              <th className="
                text-left
                p-5
                text-sm
                font-semibold
                text-zinc-600
              ">
                Status
              </th>

              <th className="
                text-left
                p-5
                text-sm
                font-semibold
                text-zinc-600
              ">
                Vigência
              </th>

              <th className="
                text-left
                p-5
                text-sm
                font-semibold
                text-zinc-600
            ">
                Ações
            </th>

            </tr>

          </thead>

          <tbody>

            {
              recurring.map(
                (item) => (

                  <tr
                    key={item.id}

                    className="
                      border-b
                      border-zinc-100
                      hover:bg-zinc-50
                      transition
                    "
                  >

                    <td className="
                      p-5
                      font-medium
                      text-zinc-900
                    ">
                      {
                        item.description
                      }
                    </td>

                    <td className="
                      p-5
                      text-zinc-600
                    ">
                      {
                        item.frequency
                      }
                    </td>

                    <td className="
                      p-5
                      text-zinc-900
                      font-semibold
                    ">

                      {
                        Number(
                          item.amount
                        ).toLocaleString(
                          'pt-BR',
                          {

                            style:
                              'currency',

                            currency:
                              'BRL',
                          }
                        )
                      }

                    </td>

                    <td className="
                      p-5
                    ">

                      <span
                        className={`
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-medium

                          ${
                            item.status
                            === 'ACTIVE'

                              ? `
                                bg-emerald-100
                                text-emerald-700
                              `

                              : item.status
                              === 'PAUSED'

                                ? `
                                  bg-amber-100
                                  text-amber-700
                                `

                                : `
                                  bg-zinc-200
                                  text-zinc-700
                                `
                          }
                        `}
                      >

                        {
                          item.status
                        }

                      </span>

                    </td>

                    <td className="
                      p-5
                      text-zinc-600
                    ">

                      {
                        item.effectiveFrom
                      }

                      {
                        item.effectiveUntil

                          ? ` até ${item.effectiveUntil}`

                          : ''
                      }

                    </td>

                      <td className="
                          p-5
                        ">

                        <div className="
                            flex
                            items-center
                            gap-3
                        ">

                            <Link
                            href={`
                                /recurring-transactions/${item.id}/edit
                            `}

                            className="
                                text-sm
                                font-medium
                                text-zinc-700
                                hover:text-zinc-900
                            "
                            >
                            Editar
                            </Link>

                            {
                            item.status === 'ACTIVE'
                            && (

                                <form
                                action={`
                                    /api/recurring-transactions/${item.id}/pause
                                `}

                                method="POST"
                                >

                                <button
                                    type="submit"

                                    className="
                                    text-sm
                                    font-medium
                                    text-amber-700
                                    hover:text-amber-900
                                    "
                                >
                                    Pausar
                                </button>

                                </form>

                                
                            )
                            }
                            {
                                item.status !== 'ENDED'
                                && (

                                    <form
                                    action={`
                                        /api/recurring-transactions/${item.id}/end
                                    `}

                                    method="POST"
                                    >

                                    <button
                                        type="submit"

                                        className="
                                        text-sm
                                        font-medium
                                        text-red-700
                                        hover:text-red-900
                                        "
                                    >
                                        Encerrar
                                    </button>

                                    </form>
                                )
                                }
                        </div>

                    </td>

                  </tr>
                )
              )
            }

          </tbody>

        </table>

      </div>

    </main>
  );
}