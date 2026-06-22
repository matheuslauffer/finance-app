import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import Link from 'next/link';

import { db } from '@/db';

import {
  recurringTransactions,
} from '@/db/schema/recurring-transactions';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  categories,
} from '@/db/schema/categories';

import {
  eq,
} from 'drizzle-orm';


import {
  formatCurrency,
} from '@/lib/currency';

type Props = {

  params: Promise<{
    id: string;
  }>;
};

function
getStatusLabel(
  status: string
) {

  switch (status) {

    case 'PROJECTED':

      return 'Projetado';

    case 'PAID':

      return 'Pago';

    case 'CANCELLED':

      return 'Cancelado';

    default:

      return status;
  }
}

function
getStatusIcon(
  status: string
) {

  switch (status) {

    case 'PROJECTED':

      return '🕒';

    case 'PAID':

      return '✅';

    case 'CANCELLED':

      return '❌';

    default:

      return '•';
  }
}

export default async function
RecurringTransactionPage({
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
  TRANSACTION
  */

  const [transaction] =
    await db

      .select({

        recurringTransaction:
          recurringTransactions,

        paymentMethod:
          paymentMethods,

        category:
          categories,
      })

      .from(
        recurringTransactions
      )

      .leftJoin(

        paymentMethods,

        eq(
          recurringTransactions.paymentMethodId,
          paymentMethods.id
        )
      )

      .leftJoin(

        categories,

        eq(
          recurringTransactions.categoryId,
          categories.id
        )
      )

      .where(
        eq(
          recurringTransactions.id,
          id
        )
      );

  if (!transaction) {

    redirect(
      '/projections'
    );
  }

  const item =
    transaction.recurringTransaction;

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

          <div className="
            flex
            items-center
            gap-3
          ">

            <h1 className="
              text-4xl
              font-bold
              text-zinc-900
            ">
              {item.description}
            </h1>

            <span>
              {
                getStatusIcon(
                  item.status
                )
              }
            </span>

          </div>

          <p className="
            text-zinc-500
            mt-2
          ">
            {
              getStatusLabel(
                item.status
              )
            }
          </p>

        </div>

        <Link
          href={`/projections/${item.financialMonthId}`}

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

      <div className="
        bg-white
        border
        border-zinc-200
        rounded-3xl
        p-8
        space-y-6
      ">

        <div>

          <p className="
            text-sm
            text-zinc-500
            mb-1
          ">
            Valor
          </p>

          <p
            className={`
              text-3xl
              font-bold

              ${
                item.transactionType
                === 'INCOME'

                  ? 'text-emerald-600'

                  : 'text-red-600'
              }
            `}
          >
            {
              formatCurrency(
                Number(
                  item.projectedAmount
                )
              )
            }
          </p>

        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
        ">

          <div>

            <p className="
              text-sm
              text-zinc-500
              mb-1
            ">
              Categoria
            </p>

            <p className="
              font-medium
              text-zinc-800
            ">
              {
                transaction.category
                  ?.name
                ?? '-'
              }
            </p>

          </div>

          <div>

            <p className="
              text-sm
              text-zinc-500
              mb-1
            ">
              Meio de pagamento
            </p>

            <p className="
              font-medium
              text-zinc-800
            ">
              {
                transaction.paymentMethod
                  ?.name
                ?? '-'
              }
            </p>

          </div>

          <div>

            <p className="
              text-sm
              text-zinc-500
              mb-1
            ">
              Vencimento
            </p>

            <p className="
              font-medium
              text-zinc-800
            ">
              {item.dueDate}
            </p>

          </div>

          <div>

            <p className="
              text-sm
              text-zinc-500
              mb-1
            ">
              Tipo
            </p>

            <p className="
              font-medium
              text-zinc-800
            ">
              {
                item.transactionType
              }
            </p>

          </div>

        </div>

        {
          item.status === 'PROJECTED'
          &&
          item.transactionType === 'EXPENSE'
          && (

            <form
              action="/api/recurring-transactions/pay"

              method="POST"

              encType="multipart/form-data"
            >

              <input
                type="hidden"

                name="recurringTransactionId"

                value={item.id}
              />

              <button
                type="submit"

                className="
                  px-5
                  py-3
                  rounded-2xl
                  bg-zinc-900
                  text-white
                  font-medium
                  hover:bg-zinc-800
                  transition
                "
              >
                Marcar como pago
              </button>

            </form>
          )
        }

      </div>

    </main>
  );
}