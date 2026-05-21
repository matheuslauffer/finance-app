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

import {
  TransactionForm,
} from '@/app/components/transaction-form';

import {
  getTransactions,
} from '@/services/transaction-service';

import {
  getRecurringTransactions,
} from '@/services/recurring-transactions-service';

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

  const [
    recentTransactions,

    recurringTransactions,
  ] =
    await Promise.all([

      getTransactions({

        userId,
      }),

      getRecurringTransactions(
        userId
      ),
    ]);

  const recentItems =
    [
      ...recentTransactions.map(
        (transaction) => ({

          id:
            transaction.id,

          kind:
            'TRANSACTION' as const,

          description:
            transaction.description,

          amount:
            transaction.amount,

          transactionType:
            transaction.transactionType,

          status:
            transaction.status,

          createdAt:
            transaction.createdAt,
        })
      ),

      ...recurringTransactions.map(
          (recurring) => ({

            id:
              recurring.id,

            kind:
              'RECURRING' as const,

            description:
              recurring.description,

            amount:
              recurring.amount,

            transactionType:
              'EXPENSE' as const,

            status:
              recurring.endedAt

                ? 'ENDED'

                : recurring.isActive

                  ? 'ACTIVE'

                  : 'PAUSED',

            createdAt:
              recurring.nextOccurrence,
          })
        ),
    ]
      .sort(
        (first, second) => (
          new Date(
            second.createdAt
          ).getTime()
          -
          new Date(
            first.createdAt
          ).getTime()
        )
      )
      .slice(
        0,
        8
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
            text-zinc-900
          "
        >
          Voltar
        </Link>

      </div>

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-[700px_1fr]
        gap-8
        items-start
      ">

        <TransactionForm

          mainCategories={
            formData.mainCategories
          }

          subcategories={
            formData.subcategories
          }

          paymentMethods={
            formData.paymentMethods
          }
        />

        <div className="
          bg-white
          border
          border-zinc-200
          rounded-3xl
          p-6
          shadow-sm
          min-h-[400px]
        ">

          <div className="
            flex
            items-center
            justify-between
            mb-6
          ">

            <div>

              <h2 className="
                text-2xl
                font-bold
                text-zinc-900
              ">
                Últimos lançamentos
              </h2>

              <p className="
                text-zinc-500
                mt-1
              ">
                Transações e recorrências recentes
              </p>

            </div>

          </div>

          <div className="
            flex
            flex-col
            gap-3
          ">

            {
              recentItems
                .map(
                  (item) => (

                    <div
                      key={`${item.kind}-${item.id}`}

                      className="
                        border
                        border-zinc-200
                        rounded-2xl
                        p-4
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <div>

                        <p className="
                          font-semibold
                          text-zinc-900
                        ">
                          {
                            item.description
                          }
                        </p>

                        <div className="
                          flex
                          items-center
                          gap-2
                          mt-2
                        ">

                          <span className="
                            text-sm
                            text-zinc-500
                          ">
                            {
                              item.transactionType
                            }
                          </span>

                          {
                            item.kind === 'RECURRING'
                            && (

                              <span className="
                                rounded-full
                                bg-sky-100
                                px-2
                                py-0.5
                                text-xs
                                font-medium
                                text-sky-700
                              ">
                                Recorrente
                              </span>
                            )
                          }

                        </div>

                      </div>

                      <p className={`
                        font-bold

                        ${
                          item.transactionType
                          === 'INCOME'

                            ? 'text-emerald-600'

                            : 'text-red-500'
                        }
                      `}>
                        R$
                        {
                          Number(
                            item.amount
                          ).toFixed(2)
                        }
                      </p>

                    </div>
                  )
                )
            }

          </div>

        </div>

      </div>

    </main>
  );
}
