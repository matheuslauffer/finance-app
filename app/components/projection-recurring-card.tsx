'use client';

import { useRouter } from 'next/navigation';

type RecurringTransactionItem = {
  id: string;
  description: string;
  status: string;
  dueDate: string;
  transactionType: 'INCOME' | 'EXPENSE';
  projectedAmount: string | number;
};

type Props = {
  item: RecurringTransactionItem;
  formatCurrency: (value: number) => string;
  getStatusLabel: (status: string) => string;
  getStatusIcon: (status: string) => string;
};

export function
ProjectionRecurringCard({

  item,

  formatCurrency,

  getStatusLabel,

  getStatusIcon,
}: Props) {

  const router =
    useRouter();

  return (

    <div

      onClick={() =>

        router.push(
          `/recurring-transactions/${item.id}`
        )
      }

      className="
        flex
        items-center
        justify-between
        border
        border-zinc-200
        rounded-2xl
        p-4
        bg-white

        hover:border-zinc-400
        hover:shadow-sm

        transition-all
        cursor-pointer
      "
    >

      <div className="flex-1">

        <div className="
          flex
          items-center
          gap-2
        ">

          <p className="
            font-medium
            text-zinc-800
          ">
            {item.description}
          </p>

          <span>
            {
              getStatusIcon(
                item.status
              )
            }
          </span>

        </div>

        <div className="
          flex
          items-center
          gap-2
          mt-2
          flex-wrap
        ">

          <p className="
            text-sm
            text-zinc-500
          ">
            {item.dueDate}
          </p>

          <span className="
            text-zinc-300
          ">
            •
          </span>

          <p className="
            text-sm
            text-zinc-500
          ">
            {
              getStatusLabel(
                item.status
              )
            }
          </p>

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

              className="mt-4"

              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <input
                type="hidden"

                name="recurringTransactionId"

                value={item.id}
              />

              <button
                type="submit"

                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-zinc-900
                  text-white
                  text-sm
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

      <p
        className={`
          font-bold
          text-lg
          ml-4

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
  );
}