import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import Link from 'next/link';

import { db } from '@/db';

import {
  transactions,
} from '@/db/schema/transactions';

import {
  eq,
} from 'drizzle-orm';

import {
  getTransactionFormData,
} from '@/services/transaction-form-service';

import {
  TransactionForm,
} from '@/app/components/transaction-form';

type Props = {

  params: {
    id: string;
  };
};

export default async function
EditTransactionPage({
  params,
}: Props) {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

  const [transaction] =
    await db

      .select()

      .from(
        transactions
      )

      .where(
        eq(
          transactions.id,

          params.id
        )
      );

  if (
    !transaction
  ) {

    redirect(
      '/transactions'
    );
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
            Editar transação
          </h1>

          <p className="
            text-zinc-500
            mt-2
          ">
            Atualize os dados
            da transação
          </p>

        </div>

        <Link
          href="
            /transactions
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

      <TransactionForm

        categories={
          formData.categories
        }

        paymentMethods={
          formData.paymentMethods
        }

        initialData={{

          id:
            transaction.id,

          description:
            transaction.description,

          amount:
            String(
              transaction.amount
            ),

          transactionType:
            transaction.transactionType
            === 'INCOME'

              ? 'INCOME'

              : 'EXPENSE',

          categoryId:
            transaction.categoryId,

          paymentMethodId:
            transaction.paymentMethodId,

          effectiveDate:
            transaction.effectiveDate,
        }}
      />

    </main>
  );
}