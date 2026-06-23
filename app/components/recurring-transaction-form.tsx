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

    parentCategoryId:
      string | null;
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

    frequency:
      | 'DAILY'
      | 'WEEKLY'
      | 'BIWEEKLY'
      | 'MONTHLY'
      | 'YEARLY';

    categoryId:
      string;

    paymentMethodId:
      string;

    dueDay:
      number;

    weekDay:
      number | null;

    effectiveUntil:
      string | null;
  };
};

export function
RecurringTransactionForm({
  categories,
  paymentMethods,
  initialData,
}: Props) {

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
    frequency,
    setFrequency,
  ] = useState<
    | 'DAILY'
    | 'WEEKLY'
    | 'BIWEEKLY'
    | 'MONTHLY'
    | 'YEARLY'
  >(
    initialData
      ?.frequency
    ?? 'MONTHLY'
  );

  function
  getCategoryLabel(
    category: {
      id: string;

      name: string;

      parentCategoryId:
        string | null;
    }
  ) {

    if (
      !category.parentCategoryId
    ) {

      return category.name;
    }

    const parent =
      categories.find(
        (item) => (
          item.id
          === category.parentCategoryId
        )
      );

    return parent
      ? `${parent.name} / ${category.name}`
      : category.name;
  }

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
      action="/api/recurring-transactions"

      method="POST"

      className="
        bg-white
        border
        border-zinc-200
        rounded-3xl
        p-8
        shadow-sm
        max-w-4xl
        space-y-6
      "
    >

      {
        initialData && (

          <input
            type="hidden"

            name="recurringTransactionId"

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

            placeholder="Ex: Aluguel, psicoterapia..."

            className="
              border
              border-zinc-300
              rounded-2xl
              px-4
              py-3
              bg-white
              outline-none
              transition
              focus:border-zinc-900
              text-zinc-900
              placeholder:text-zinc-400
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

            placeholder="R$ 0,00"

            className="
              border
              border-zinc-300
              rounded-2xl
              px-4
              py-3
              bg-white
              outline-none
              transition
              focus:border-zinc-900
              text-zinc-900
              placeholder:text-zinc-400
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
            Frequência
          </label>

          <select
            name="frequency"

            value={frequency}

            onChange={(event) => {

              setFrequency(
                event.target.value as
                  | 'DAILY'
                  | 'WEEKLY'
                  | 'BIWEEKLY'
                  | 'MONTHLY'
                  | 'YEARLY'
              );
            }}

            required

            className="
              border
              border-zinc-300
              rounded-2xl
              px-4
              py-3
              bg-white
              text-zinc-900
              placeholder:text-zinc-400
            "
          >

            <option value="DAILY">
              Diário
            </option>

            <option value="WEEKLY">
              Semanal
            </option>

            <option value="BIWEEKLY">
              Quinzenal
            </option>

            <option value="MONTHLY">
              Mensal
            </option>

            <option value="YEARLY">
              Anual
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
              rounded-2xl
              px-4
              py-3
              bg-white
              transition
              text-zinc-900
              placeholder:text-zinc-400

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
            "
          >

            {
              categories.map(
                (category) => (

                  <option
                    key={category.id}

                    value={category.id}
                  >
                    {
                      getCategoryLabel(
                        category
                      )
                    }
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
            Método pagamento
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
            "
          >

            {
              paymentMethods.map(
                (method) => (

                  <option
                    key={method.id}

                    value={method.id}
                  >
                    {method.name}
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
            {
              frequency === 'WEEKLY'
                ? 'Dia da semana'
                : 'Dia do vencimento'
            }
          </label>

          {
            frequency === 'WEEKLY'
              ? (

                  <select
                    name="weekDay"

                    required

                    defaultValue={
                      initialData
                        ?.weekDay
                      ?? 1
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
                    "
                  >
                    <option value={0}>
                      Domingo
                    </option>

                    <option value={1}>
                      Segunda-feira
                    </option>

                    <option value={2}>
                      Terça-feira
                    </option>

                    <option value={3}>
                      Quarta-feira
                    </option>

                    <option value={4}>
                      Quinta-feira
                    </option>

                    <option value={5}>
                      Sexta-feira
                    </option>

                    <option value={6}>
                      Sábado
                    </option>
                  </select>
                )
              : (

                  <input
                    type="number"

                    name="dueDay"

                    required

                    min={1}

                    max={31}

                    defaultValue={
                      initialData
                        ?.dueDay
                      ?? 1
                    }

                    placeholder="Ex: 6"

                    className="
                      border
                      border-zinc-300
                      rounded-2xl
                      px-4
                      py-3
                      bg-white
                      text-zinc-900
                      placeholder:text-zinc-400
                    "
                  />
                )
          }

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
            Fim (opcional)
          </label>

          <input
            type="date"

            name="effectiveUntil"

            defaultValue={
              initialData
                ?.effectiveUntil
              ?? ''
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
            "
          />

        </div>

      </div>

      <SubmitButton
        label={
          initialData

            ? 'Salvar nova versão'

            : 'Criar recorrência'
        }
      />

    </form>
  );
}
