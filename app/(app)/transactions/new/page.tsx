import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import Link from 'next/link';

import {
  getTransactionFormData,
} from '@/services/transaction-form-service';

export default async function
NewTransactionPage() {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

  const formData =
    await getTransactionFormData(
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
            Nova transação
          </h1>

          <p className="
            text-zinc-500
            mt-2
          ">
            Registre uma nova movimentação financeira
          </p>

        </div>

        <Link
          href="/transactions"

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
          "
        >
          Voltar
        </Link>

      </div>

      <form
        action="/api/transactions"
        method="POST"

        className="
          bg-white
          border
          border-zinc-200
          rounded-3xl
          p-8
          shadow-sm
          max-w-3xl
          space-y-6
        "
      >

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
        ">

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
              Descrição
            </label>

            <input
              type="text"

              name="description"

              required

              placeholder="
                Ex: Mercado, salário...
              "

              className="
                border
                border-zinc-300
                rounded-2xl
                px-4
                py-3
                bg-white
                outline-none
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
              Valor
            </label>

            <input
              type="number"

              step="0.01"

              name="amount"

              required

              placeholder="
                0.00
              "

              className="
                border
                border-zinc-300
                rounded-2xl
                px-4
                py-3
                bg-white
                outline-none
              "
            />

          </div>

        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
        ">

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
              Categoria
            </label>

            <select
              name="categoryId"

              required

              className="
                border
                border-zinc-300
                rounded-2xl
                px-4
                py-3
                bg-white
              "
            >

              {
                formData.categories.map(
                  (category) => (

                    <option
                      key={category.id}

                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )
              }

            </select>

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
              Método de pagamento
            </label>

            <select
              name="paymentMethodId"

              required

              className="
                border
                border-zinc-300
                rounded-2xl
                px-4
                py-3
                bg-white
              "
            >

              {
                formData
                  .paymentMethods
                  .map(
                    (
                      paymentMethod
                    ) => (

                      <option
                        key={
                          paymentMethod.id
                        }

                        value={
                          paymentMethod.id
                        }
                      >
                        {
                          paymentMethod.name
                        }
                      </option>
                    )
                  )
              }

            </select>

          </div>

        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
        ">

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
              name="transactionType"

              required

              className="
                border
                border-zinc-300
                rounded-2xl
                px-4
                py-3
                bg-white
              "
            >

              <option value="EXPENSE">
                Despesa
              </option>

              <option value="INCOME">
                Receita
              </option>

            </select>

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
              Data
            </label>

            <input
              type="date"

              name="effectiveDate"

              required

              className="
                border
                border-zinc-300
                rounded-2xl
                px-4
                py-3
                bg-white
                outline-none
              "
            />

          </div>

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
          Salvar transação
        </button>

      </form>

    </main>
  );
}