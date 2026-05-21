'use client';

import {
  useState,
} from 'react';

import {
  SubmitButton,
} from './submit-button';

type Props = {

  initialData?: {
    id: string;

    paymentMethodId: string;

    categoryId: string;

    description: string;

    amount: string;

    transactionType:
      | 'INCOME'
      | 'EXPENSE';

    effectiveDate: string;

    dueDate?: string;
  };

  mainCategories: {

    id: string;

    name: string;

    parentCategoryId: string | null;
  }[];

  subcategories: {

    id: string;

    name: string;

    parentCategoryId: string | null;
  }[];

  paymentMethods: {
    id: string;

    name: string;

    supportsInstallments: boolean;

    methodType: string;
  }[];
};

export function
TransactionForm({
  mainCategories,
  subcategories,
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
    selectedPaymentMethodId,
    setSelectedPaymentMethodId,
  ] = useState(

    initialData
      ?.paymentMethodId

    ?? paymentMethods[0]?.id
  );

  const [
    selectedMainCategoryId,
    setSelectedMainCategoryId,
  ] = useState(

    initialData
      ?.categoryId

    ?? mainCategories[0]?.id
  );

  const [
    installmentMode,
    setInstallmentMode,
  ] = useState('1');

  const [
    isRecurring,
    setIsRecurring,
  ] = useState(false);

  const selectedPaymentMethod =
    paymentMethods.find(
      (method) => {

        return (
          method.id
          ===
          selectedPaymentMethodId
        );
      }
    );

  const filteredSubcategories =
  subcategories.filter(
    (subcategory) => (

      subcategory.parentCategoryId
      ===
      selectedMainCategoryId
    )
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
      mainCategories.find(
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

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
          ">

            {/* MAIN CATEGORY */}

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

                name="mainCategoryId"
                
                value={
                  selectedMainCategoryId
                }

                onChange={(e) => {

                  setSelectedMainCategoryId(
                    e.target.value
                  );
                }}

                className="
                  border
                  border-zinc-300
                  rounded-2xl
                  px-4
                  py-3
                  bg-white
                  text-zinc-900
                "
              >

                {
                  mainCategories.map(
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

            {/* SUBCATEGORY */}

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
                Subcategoria
              </label>

              <select
                name="subcategoryId"

                defaultValue=""

                required={
                  filteredSubcategories.length > 0
                }

                className="
                  border
                  border-zinc-300
                  rounded-2xl
                  px-4
                  py-3
                  bg-white
                  text-zinc-900
                "
              >

                <option value="">
                  Selecione
                </option>

                {
                  filteredSubcategories.map(
                    (subcategory) => (

                      <option
                        key={subcategory.id}
                        value={subcategory.id}
                      >
                        {subcategory.name}
                      </option>
                    )
                  )
                }

              </select>

            </div>

          </div>

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

            value={
              selectedPaymentMethodId
            }

            onChange={(e) => {

              setSelectedPaymentMethodId(
                e.target.value
              );
            }}

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

      {
        !initialData && (

          <div className="
            border
            border-zinc-200
            rounded-2xl
            p-4
            bg-zinc-50
          ">

            <label className="
              flex
              items-center
              gap-3
              text-sm
              font-medium
              text-zinc-800
            ">
              <input
                type="checkbox"

                name="isRecurring"

                checked={isRecurring}

                onChange={(e) => {

                  setIsRecurring(
                    e.target.checked
                  );
                }}

                className="
                  h-4
                  w-4
                  accent-zinc-900
                "
              />

              Recorrente
            </label>

          </div>
        )
      }

      {
        !isRecurring
        &&
        selectedPaymentMethod
          ?.supportsInstallments && (

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
              Parcelamento
            </label>

            <div className="
  flex
  flex-col
  gap-4
">

  <div className="
    flex
    flex-col
    gap-2
  ">

    <select
      value={installmentMode}

      onChange={(e) => {

        setInstallmentMode(
          e.target.value
        );
      }}

      name="
        installmentCount
      "

      className="
        border
        border-zinc-300
        rounded-2xl
        px-4
        py-3
        bg-white
        text-zinc-900
      "
    >

      {
        Array.from({
          length: 12,
        }).map(
          (_, index) => {

            const value =
              String(index + 1);

            return (

              <option
                key={value}

                value={value}
              >
                {value}x
              </option>
            );
          }
        )
      }

      <option value="custom">
        Outro...
      </option>

    </select>

  </div>

  {
    installmentMode
    === 'custom' && (

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
          Quantidade de parcelas
        </label>

        <input
          type="number"

          min="1"

          max="999"

          name="
            customInstallmentCount
          "

          placeholder="
            Ex: 18
          "

          className="
            border
            border-zinc-300
            rounded-2xl
            px-4
            py-3
            bg-white
            text-zinc-900
          "
        />

      </div>
    )
  }

</div>

          </div>
        )
      }

      {
        isRecurring && (

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

                required={isRecurring}

                defaultValue="MONTHLY"

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
                Fim
              </label>

              <input
                type="date"

                name="effectiveUntil"

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
            {
              isRecurring
                ? 'Início'
                : 'Data'
            }
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

            : isRecurring

              ? 'Criar recorrência'

              : 'Criar transação'
        }
      />

    </form>
  );
}
