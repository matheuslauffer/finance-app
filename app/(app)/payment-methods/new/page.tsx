import Link from 'next/link';

import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

export default async function
NewPaymentMethodPage() {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

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
            Novo método
          </h1>

          <p className="
            text-zinc-500
            mt-2
          ">
            Cadastre cartões,
            PIX e contas
          </p>

        </div>

        <Link
          href="
            /payment-methods
          "

          className="
            border
            border-zinc-300
            bg-white
            px-5
            py-3
            rounded-2xl
            hover:bg-zinc-50
            transition
            font-medium
            text-zinc-900
          "
        >
          Voltar
        </Link>

      </div>

      <form
        action="
          /api/payment-methods
        "

        method="POST"

        className="
          bg-white
          border
          border-zinc-200
          rounded-3xl
          p-8
          shadow-sm
          max-w-2xl
          space-y-6
        "
      >

        <div className="
          flex
          flex-col
          gap-2
        ">

          <label className="
            text-sm
            font-medium
            text-zinc-700
          ">
            Nome
          </label>

          <input
            type="text"

            name="name"

            required

            placeholder="
              Ex: Nubank,
              Carteira,
              Itaú...
            "

            className="
              border
              border-zinc-300
              rounded-2xl
              px-4
              py-3
              bg-white
              text-zinc-900
              placeholder:text-zinc-400
              outline-none
              transition
              focus:border-zinc-900
            "
          />

        </div>

        <div className="
          flex
          flex-col
          gap-2
        ">

          <label className="
            text-sm
            font-medium
            text-zinc-700
          ">
            Tipo
          </label>

          <select
            name="type"

            required

            className="
              border
              border-zinc-300
              rounded-2xl
              px-4
              py-3
              bg-white
              text-zinc-900
              outline-none
              transition
              focus:border-zinc-900
            "
          >

            <option value="CREDIT_CARD">
              Cartão de crédito
            </option>

            <option value="DEBIT_CARD">
              Cartão de débito
            </option>

            <option value="PIX">
              PIX
            </option>

            <option value="CASH">
              Dinheiro
            </option>

            <option value="BANK_TRANSFER">
              Transferência bancária
            </option>

          </select>

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
          Salvar método
        </button>

      </form>

    </main>
  );
}