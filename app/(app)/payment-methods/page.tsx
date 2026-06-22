import Link from 'next/link';

import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import {
  getPaymentMethods,
} from '../../../services/payment-method-service';

export default async function
PaymentMethodsPage() {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

  const paymentMethods =
    await getPaymentMethods(
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
            Métodos de pagamento
          </h1>

          <p className="
            text-zinc-500
            mt-2
          ">
            Gerencie cartões,
            PIX e contas
          </p>

        </div>

        <Link
          href="/payment-methods/new"

          className="
            bg-zinc-900
            text-white
            px-5
            py-3
            rounded-2xl
            font-medium
            hover:bg-zinc-800
            transition
          "
        >
          Novo método
        </Link>

      </div>

      <div className="
        bg-white
        border
        border-zinc-200
        rounded-3xl
        overflow-hidden
      ">

        {
          paymentMethods.map(
            (method) => (

              <div
                key={method.id}

                className="
                  flex
                  items-center
                  justify-between
                  px-6
                  py-5
                  border-b
                  border-zinc-100
                  last:border-b-0
                "
              >

                <div className="
                  flex
                  flex-col
                  gap-1
                ">

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <p className="
                      font-semibold
                      text-zinc-900
                    ">
                      {method.name}
                    </p>

                    {
                      method.supportsInstallments && (

                        <span className="
                          text-xs
                          font-medium
                          px-2
                          py-1
                          rounded-full
                          bg-emerald-100
                          text-emerald-700
                        ">
                          Parcelado
                        </span>
                      )
                    }

                  </div>

                  <p className="
                    text-sm
                    text-zinc-500
                  ">
                    {method.methodType}
                  </p>

                  {
                    method.supportsInstallments
                    &&
                    method.closingDay
                    &&
                    method.dueDay && (

                      <p className="
                        text-sm
                        text-zinc-400
                      ">
                        Fecha dia {
                          method.closingDay
                        }
                        {' • '}
                        Vence dia {
                          method.dueDay
                        }
                      </p>
                    )
                  }

                </div>

                <form
                  action={
                    `/api/payment-methods/${method.id}/toggle`
                  }

                  method="POST"
                >

                  <button
                    type="submit"

                    className={`
                      relative
                      w-14
                      h-8
                      rounded-full
                      transition-all
                      duration-300

                      ${
                        method.isActive

                          ? `
                            bg-emerald-500
                          `

                          : `
                            bg-red-500
                          `
                      }
                    `}
                  >

                    <span
                      className={`
                        absolute
                        top-1
                        w-6
                        h-6
                        rounded-full
                        bg-white
                        transition-all
                        duration-300

                        ${
                          method.isActive

                            ? 'left-7'

                            : 'left-1'
                        }
                      `}
                    />

                  </button>

                  <Link
                    href={`/payment-methods/${method.id}/edit`}

                    className="
                      text-sm
                      font-medium
                      text-zinc-700
                      hover:text-zinc-900
                    "
                  >
                    Editar
                  </Link>

                </form>

              </div>
            )
          )
        }

      </div>

    </main>
  );
}