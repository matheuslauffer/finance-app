import Link from 'next/link';

import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import {
  getPaymentMethods,
} from '@/services/payment-method-service';

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
          href="
            /payment-methods/new
          "

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
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-6
      ">

        {
          paymentMethods.map(
            (method) => (

              <div
                key={method.id}

                className="
                  bg-white
                  border
                  border-zinc-200
                  rounded-3xl
                  p-6
                  shadow-sm
                "
              >

                <h2 className="
                  text-xl
                  font-bold
                  text-zinc-900
                ">
                  {method.name}
                </h2>

                <p className="
                  text-zinc-500
                  mt-2
                ">
                  {method.type}
                </p>

              </div>
            )
          )
        }

      </div>

    </main>
  );
}