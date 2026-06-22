import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import Link from 'next/link';

import { db } from '@/db';

import {
  eq,
} from 'drizzle-orm';

import {
  getRecurringTransactionFormData,
} from '@/services/recurring-transaction-form-service';

import {
  RecurringTransactionForm,
} from '@/app/components/recurring-transaction-form';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

type Props = {

  params: Promise<{
    id: string;
  }>;
};

export default async function
EditRecurringTransactionPage({
  params,
}: Props) {

  const {
    id,
  } = await params;

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

  /*
  SNAPSHOT
  */

  const [snapshot] =
    await db

      .select()

      .from(
        recurringTransactions
      )

      .where(
        eq(
          recurringTransactions.id,
          id
        )
      );

  if (!snapshot) {

    redirect(
      '/recurring-transactions'
    );
  }

  /*
  RECURRENCE
  */

  const [recurring] =
    await db

      .select()

      .from(
        recurrences
      )

      .where(
        eq(
          recurrences.id,
          snapshot.recurrenceId
        )
      );

  if (!recurring) {

    redirect(
      '/recurring-transactions'
    );
  }

  /*
  FORM DATA
  */

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
            Editar recorrência
          </h1>

          <p className="
            text-zinc-500
            mt-2
          ">
            Alterações criarão
            uma nova versão
          </p>

        </div>

        <Link
          href="/recurring-transactions"

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

        initialData={{

          id:
            recurring.id,

          description:
            recurring.description,

          amount:
            String(
              recurring.amount
            ),

          transactionType:
            recurring.transactionType,

          frequency:
            recurring.frequency,

          categoryId:
            recurring.categoryId,

          paymentMethodId:
            recurring.paymentMethodId,

          effectiveFrom:
            recurring.nextOccurrence,

          effectiveUntil:
            recurring.endedAt,
        }}
      />

    </main>
  );
}