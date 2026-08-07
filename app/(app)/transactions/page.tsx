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
import { getPaymentMethods } from '@/services/payment-method-service';

import { TransactionsList } from './TransactionsList';

type Props = {
  searchParams:
    Promise<{

      search?: string;

      type?:
        | 'INCOME'
        | 'EXPENSE';
      paymentMethodId?: string;
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

  const paymentMethodId =
    params.paymentMethodId;

  const paymentMethods =
    await getPaymentMethods(userId);

  const transactions =
    await getTransactions({

      userId,

      search,

      transactionType:
        type,

      paymentMethodId,

      limit: 20,
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
          name="paymentMethodId"

          defaultValue={paymentMethodId}

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
            Todos métodos
          </option>

          {
            paymentMethods.map(
              (pm) => (

                <option key={pm.id} value={pm.id}>
                  {pm.name}
                </option>
              )
            )
          }

        </select>

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

      <TransactionsList
        initialTransactions={
          transactions
        }
        userId={userId}
        search={search}
        type={type}
        paymentMethodId={paymentMethodId}
      />

    </main>
  );
}