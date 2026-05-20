import Link from 'next/link';

import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import {
  getTransactions,
} from '@/services/transaction-service';

type Props = {
  searchParams:
    Promise<{

      search?: string;

      type?:
        | 'INCOME'
        | 'EXPENSE';
    }>;
};

export default async function
TransactionsPage({
  searchParams,
}: Props) {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

  const params =
    await searchParams;

  const search =
    params.search;

  const type =
    params.type;

  const transactions =
    await getTransactions({

      userId,

      search,

      transactionType:
        type,
    });

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
        gap-4
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
            text-zinc-900
          ">
            Transações
          </h1>

          <p className="
            text-zinc-500
            mt-2
          ">
            Histórico completo das suas movimentações
          </p>

        </div>

        <Link
          href="/transactions/new"

          className="
            bg-zinc-900
            text-white
            px-5
            py-3
            rounded-2xl
            font-medium
            hover:bg-zinc-800
            transition
            shadow-sm
          "
        >
          Nova transação
        </Link>

      </div>

      <form
        className="
          flex
          flex-col
          md:flex-row
          gap-4
          mb-8
        "
      >

        <input
          name="search"

          defaultValue={search}

          placeholder="
            Buscar transação
          "

          className="
            flex-1
            border
            border-zinc-300
            rounded-2xl
            px-4
            py-3
            bg-white
            outline-none
          "
        />

        <select
          name="type"

          defaultValue={type}

          className="
            border
            border-zinc-300
            rounded-2xl
            px-4
            py-3
            bg-white
            outline-none
          "
        >

          <option value="">
            Todos
          </option>

          <option value="INCOME">
            Receitas
          </option>

          <option value="EXPENSE">
            Despesas
          </option>

        </select>

        <button
          type="submit"

          className="
            bg-zinc-900
            text-white
            px-6
            py-3
            rounded-2xl
            hover:bg-zinc-800
            transition
            font-medium
          "
        >
          Filtrar
        </button>

      </form>

      <div className="
        flex
        flex-col
        gap-4
      ">

        {
          transactions.map(
            (transaction) => (

              <div
                key={transaction.id}

                className="
                  bg-white
                  border
                  border-zinc-200
                  rounded-3xl
                  p-6
                  flex
                  justify-between
                  items-center
                  hover:shadow-md
                  transition
                  hover:-translate-y-0.5
                "
              >

                <div>

                  <Link
                    href={
                      `/transactions/${transaction.id}`
                    }
                  >

                    <p className="
                      text-lg
                      font-semibold
                      text-zinc-900
                      hover:text-zinc-700
                      transition
                    ">
                      {
                        transaction.description
                      }
                    </p>

                  </Link>

                  <p className="
                    text-sm
                    text-emerald-600
                    font-medium
                    mt-1
                  ">
                    {
                      transaction.status
                    }
                  </p>

                </div>

                <div className="
                  text-right
                ">

                  <p className="
                    text-2xl
                    font-bold
                    text-zinc-900
                  ">
                    R$
                    {
                      Number(
                        transaction.amount
                      )formatCurrency(value)
                    }
                  </p>

                  <p className={`
                    text-sm
                    font-medium
                    mt-1
                    uppercase
                    tracking-wide

                    ${
                      transaction.transactionType
                      === 'INCOME'

                        ? 'text-emerald-600'

                        : 'text-red-500'
                    }
                  `}>
                    {
                      transaction.transactionType
                    }
                  </p>

                  <div className="
                    flex
                    justify-end
                    gap-4
                    mt-3
                  ">

                    <Link
                      href={`
                        /transactions/${transaction.id}/edit
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

                    <form
                      action={`
                        /api/transactions/${transaction.id}/delete
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
                        Excluir
                      </button>

                    </form>

                  </div>

                </div>

              </div>
            )
          )
        }

      </div>

    </main>
  );
}