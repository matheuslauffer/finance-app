'use client';

import {
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

type Props = {
  transaction: {
    id: string;

    description: string;

    amount: string;
  };
};

export function
EditTransactionForm({
  transaction,
}: Props) {

  const router =
    useRouter();

  const [
    description,

    setDescription,
  ] = useState(
    transaction.description
  );

  const [
    amount,

    setAmount,
  ] = useState(
    transaction.amount
  );

  async function
  handleSubmit(
    event:
      React.FormEvent
  ) {

    event.preventDefault();

    await fetch(
      `/api/transactions/${transaction.id}/edit`,
      {
        method: 'PATCH',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({

            description,

            amount,
          }),
      }
    );

    router.push(
      `/transactions/${transaction.id}`
    );

    router.refresh();
  }

  return (

    <form
      onSubmit={
        handleSubmit
      }

      className="
        bg-white
        border
        border-zinc-200
        rounded-3xl
        p-8
        shadow-sm
        space-y-6
      "
    >

      <div>

        <label className="
          block
          text-sm
          font-medium
          mb-2
          text-zinc-700
        ">
          Descrição
        </label>

        <input
          value={description}

          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }

          className="
            w-full
            border
            border-zinc-300
            rounded-2xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-zinc-900
          "
        />

      </div>

      <div>

        <label className="
          block
          text-sm
          font-medium
          mb-2
          text-zinc-700
        ">
          Valor
        </label>

        <input
          value={amount}

          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }

          className="
            w-full
            border
            border-zinc-300
            rounded-2xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-zinc-900
          "
        />

      </div>

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
        Salvar alterações
      </button>

    </form>
  );
}