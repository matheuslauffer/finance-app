import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import Link from 'next/link';

import { db } from '@/db';

import {
  recurrences,
} from '@/db/schema/recurrences';

import {
  eq,
  desc,
} from 'drizzle-orm';

import {
  formatCurrency,
} from '@/lib/currency';

export default async function
RecurringTransactionsPage() {

  const session =
    await auth();

  if (!session.userId) {

    redirect('/sign-in');
  }

  const recurringList =
    await db

      .select()

      .from(
        recurrences
      )

      .where(
        eq(
          recurrences.userId,
          session.userId
        )
      )

      .orderBy(
        desc(
          recurrences.nextOccurrence
        )
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
            Recorrências
          </h1>

          <p className="
            text-zinc-500
            mt-2
          ">
            Gerencie seus lançamentos recorrentes
          </p>

        </div>

        <Link
          href="/recurring-transactions/new"

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
          Nova recorrência
        </Link>

      </div>

      <div className="
        space-y-3
      ">

        {
          recurringList.map(
            (item) => (

              <Link

                key={item.id}

                href={`/recurring-transactions/${item.id}/edit`}

                className="
                  block
                  bg-white
                  border
                  border-zinc-200
                  rounded-2xl
                  p-5

                  hover:border-zinc-400
                  hover:shadow-sm

                  transition
                "
              >

                <div className="
                  flex
                  items-center
                  justify-between
                ">

                  <div>

                    <h2 className="
                      font-semibold
                      text-zinc-900
                    ">
                      {item.description}
                    </h2>

                    <p className="
                      text-sm
                      text-zinc-500
                      mt-1
                    ">
                      {item.frequency}
                    </p>

                  </div>

                  <p
                    className={`
                      font-bold
                      text-lg

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
                          item.amount
                        )
                      )
                    }
                  </p>

                </div>

              </Link>
            )
          )
        }

      </div>

    </main>
  );
}