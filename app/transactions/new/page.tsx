'use client';

import { useState } from 'react';

import { useEffect } from 'react';

import { Category }
  from '@/types/category';

import { PaymentMethod }
  from '@/types/payment-method';

export default function
NewTransactionPage() {

  const [description,
    setDescription] =
    useState('');

  const [amount,
    setAmount] =
    useState('');

  const [installments,
    setInstallments] =
    useState(1);

  const [loading,
    setLoading] =
    useState(false);

  const [categories,
  setCategories] =
  useState<Category[]>([]);

  const [paymentMethods,
    setPaymentMethods] =
    useState<PaymentMethod[]>([]);

  const [selectedCategory,
    setSelectedCategory] =
    useState('');

  const [selectedPaymentMethod,
    setSelectedPaymentMethod] =
    useState('');

  useEffect(() => {

  async function loadData() {

    const [
      categoriesResponse,
      paymentMethodsResponse,
    ] = await Promise.all([
      fetch('/api/categories'),

      fetch('/api/payment-methods'),
    ]);

    const categoriesData =
      await categoriesResponse.json();

    const paymentMethodsData =
      await paymentMethodsResponse.json();

    setCategories(
      categoriesData
    );

    setPaymentMethods(
      paymentMethodsData
    );

    // Seleciona primeiro item automaticamente

    if (categoriesData[0]) {

      setSelectedCategory(
        categoriesData[0].id
      );
    }

    if (
      paymentMethodsData[0]
    ) {

      setSelectedPaymentMethod(
        paymentMethodsData[0].id
      );
    }
  }

  loadData();

}, []);

  async function
  handleSubmit(
    event: React.FormEvent
  ) {

    event.preventDefault();

    try {

      setLoading(true);

      await fetch(
        '/api/transactions',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            
            paymentMethodId:
              selectedPaymentMethod,

            categoryId:
              selectedCategory,

            description,

            amount,

            installmentCount:
              installments,

            operationType:
              installments > 1
                ? 'INSTALLMENT_PURCHASE'
                : 'PURCHASE',

            transactionType:
              'EXPENSE',

            status:
              'CONFIRMED',

            occurredAt:
              new Date(),

            effectiveDate:
              new Date()
                .toISOString()
                .split('T')[0],
          }),
        }
      );

      alert(
        'Transação criada!'
      );

      setDescription('');
      setAmount('');
      setInstallments(1);

    } catch (error) {

      console.error(error);

      alert(
        'Erro ao criar transação'
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <main className="p-10 max-w-xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Nova Transação
      </h1>
      <select
  value={selectedCategory}

  onChange={(e) =>
    setSelectedCategory(
      e.target.value
    )
  }

  className="
    border
    p-3
    rounded-xl
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

<select
  value={
    selectedPaymentMethod
  }

  onChange={(e) =>
    setSelectedPaymentMethod(
      e.target.value
    )
  }

  className="
    border
    p-3
    rounded-xl
  "
>

  {
    paymentMethods.map(
      (paymentMethod) => (

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
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >

        <input
          type="text"

          placeholder="Descrição"

          value={description}

          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }

          className="
            border
            p-3
            rounded-xl
          "
        />

        <input
          type="number"

          placeholder="Valor"

          value={amount}

          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }

          className="
            border
            p-3
            rounded-xl
          "
        />

        <input
          type="number"

          placeholder="Parcelas"

          value={installments}

          onChange={(e) =>
            setInstallments(
              Number(e.target.value)
            )
          }

          min={1}

          className="
            border
            p-3
            rounded-xl
          "
        />

        <button
          type="submit"

          disabled={loading}

          className="
            bg-black
            text-white
            p-3
            rounded-xl
          "
        >

          {
            loading
              ? 'Salvando...'
              : 'Criar transação'
          }

        </button>

      </form>

    </main>
  );
}