'use client';

import {
  useState,
} from 'react';

import {
  SubmitButton,
} from './submit-button';

type Props = {

  categories: {
    id: string;

    name: string;
  }[];

  paymentMethods: {
    id: string;

    name: string;
  }[];

  initialData?: {

    id: string;

    description: string;

    amount: string;

    transactionType:
      | 'INCOME'
      | 'EXPENSE';

    categoryId:
      string;

    paymentMethodId:
      string;

    effectiveDate:
      string;
  };
};

export function
TransactionForm({
  categories,
  paymentMethods,
  initialData,
}: Props) {

  const [
    transactionType,
    setTransactionType,
  ] = useState<
    'INCOME'
    | 'EXPENSE'
  >(
    initialData
      ?.transactionType

    ?? 'EXPENSE'
  );

  const [
    amount,
    setAmount,
  ] = useState(

    initialData

      ? new Intl
          .NumberFormat(
            'pt-BR',
            {

              style:
                'currency',

              currency:
                'BRL',
            }
          )
          .format(
            Number(
              initialData.amount
            )
          )

      : ''
  );

  function
  formatCurrency(
    value: string
  ) {

    const numbers =
      value.replace(
        /\D/g,
        ''
      );

    const amount =
      Number(numbers)
      / 100;

    return new Intl
      .NumberFormat(
        'pt-BR',
        {

          style:
            'currency',

          currency:
            'BRL',
        }
      )
      .format(amount);
  }

  return (

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

      {
        initialData && (

          <input
            type="hidden"

            name="
              transactionId
            "

            value={
              initialData.id
            }
          />
        )
      }

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

            defaultValue={
              initialData
                ?.description
            }

            placeholder="
              Ex: Mercado,
              aluguel,
              salário...
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
              appearance-none
              opacity-100
              font-medium
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
            type="text"

            value={amount}

            onChange={(e) => {

              setAmount(
                formatCurrency(
                  e.target.value
                )
              );
            }}

            placeholder="
              R$ 0,00
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
              appearance-none
              opacity-100
              font-medium
            "
          />

          <input
            type="hidden"

            name="amount"

            value={
              amount

                .replace(
                  /\D/g,
                  ''
                )

                ? String(

                    Number(

                      amount.replace(
                        /\D/g,
                        ''
                      )
                    ) / 100
                  )

                : ''
            }
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

            defaultValue={
              initialData
                ?.categoryId
            }

            className="
              border
              border-zinc-300
              rounded-2xl
              px-4
              py-3
              bg-white
              text-zinc-900
              placeholder:text-zinc-400
              appearance-none
              opacity-100
            "
          >

            {
              categories.map(
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

            defaultValue={
              initialData
                ?.paymentMethodId
            }

            className="
              border
              border-zinc-300
              rounded-2xl
              px-4
              py-3
              bg-white
              text-zinc-900
              placeholder:text-zinc-400
              appearance-none
              opacity-100
            "
          >

            {
              paymentMethods.map(
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

            value={transactionType}

            onChange={(e) => {

              setTransactionType(
                e.target.value as
                  | 'INCOME'
                  | 'EXPENSE'
              );
            }}

            required

            className={`
              border
              border-zinc-300
              rounded-2xl
              px-4
              py-3
              bg-white
              text-zinc-900
              placeholder:text-zinc-400
              appearance-none
              opacity-100
              font-medium

              ${
                transactionType
                === 'INCOME'

                  ? `
                    border-emerald-300
                    text-emerald-700
                  `

                  : `
                    border-red-300
                    text-red-700
                  `
              }
            `}
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

            defaultValue={
              initialData
                ?.effectiveDate
            }

            className="
              border
              border-zinc-300
              rounded-2xl
              px-4
              py-3
              bg-white
              text-zinc-900
              placeholder:text-zinc-400
              appearance-none
              opacity-100
            "
          />

        </div>

      </div>

      <SubmitButton
        label={
          initialData

            ? 'Salvar alterações'

            : 'Criar transação'
        }
      />

    </form>
  );
}