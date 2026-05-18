import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import Link from 'next/link';

import {
  getRecurringTransactionFormData,
} from '@/services/recurring-transaction-form-service';

import {
  RecurringTransactionForm,
} from '@/app/components/recurring-transaction-form';

export default async function
NewRecurringTransactionPage() {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

  const formData =
    await getRecurringTransactionFormData(
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
            Nova recorrência
          </h1>

          <p className="
            text-zinc-500
            mt-2
          ">
            Configure um compromisso financeiro recorrente
          </p>

        </div>

        <Link
          href="
            /recurring-transactions
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
          "
        >
          Voltar
        </Link>

      </div>

      <RecurringTransactionForm
        categories={
          formData.categories
        }

        paymentMethods={
          formData.paymentMethods
        }
      />

    </main>
  );
}