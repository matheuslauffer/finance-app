import Link from 'next/link';

import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import { db } from '@/db';

import {
  paymentMethods,
} from '@/db/schema/payment-methods';

import {
  and,
  eq,
} from 'drizzle-orm';

type Props = {

  params: Promise<{
    id: string;
  }>;
};

export default async function
EditPaymentMethodPage({
  params,
}: Props) {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

  const {
    id,
  } = await params;

  const [paymentMethod] =
    await db

      .select()

      .from(
        paymentMethods
      )

      .where(
        and(

          eq(
            paymentMethods.id,
            id
          ),

          eq(
            paymentMethods.userId,
            userId
          )
        )
      );

  if (!paymentMethod) {

    redirect(
      '/payment-methods'
    );
  }

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
            Editar método
          </h1>

          <p className="
            text-zinc-500
            mt-2
          ">
            Configure cartões,
            PIX e contas
          </p>

        </div>

        <Link
          href="/payment-methods"

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

      <form
        action={`/api/payment-methods/${paymentMethod.id}`}

        method="POST"

        className="
          bg-white
          border
          border-zinc-200
          rounded-3xl
          p-8
          shadow-sm
          max-w-2xl
          space-y-6
        "
      >

        {/* NAME */}

        <div className="
          flex
          flex-col
          gap-2
        ">

          <label className="
            text-sm
            font-medium
            text-zinc-700
          ">
            Nome
          </label>

          <input
            type="text"

            name="name"

            defaultValue={
              paymentMethod.name
            }

            required

            placeholder="
              Ex: Nubank,
              Carteira,
              Itaú...
            "

            className="
              border
              border-zinc-300
              rounded-2xl
              px-4
              py-3
              bg-white
              text-zinc-900
              placeholder:text-zinc-400
              outline-none
              transition
              focus:border-zinc-900
            "
          />

        </div>

        {/* TYPE */}

        <div className="
          flex
          flex-col
          gap-2
        ">

          <label className="
            text-sm
            font-medium
            text-zinc-700
          ">
            Tipo
          </label>

          <select
            name="methodType"

            required

            defaultValue={
              paymentMethod.methodType
            }

            className="
              border
              border-zinc-300
              rounded-2xl
              px-4
              py-3
              bg-white
              text-zinc-900
              outline-none
              transition
              focus:border-zinc-900
            "
          >

            <option value="CREDIT_CARD">
              Cartão de crédito
            </option>

            <option value="DEBIT">
              Cartão de débito
            </option>

            <option value="PIX">
              PIX
            </option>

            <option value="BANK_TRANSFER">
              Transferência bancária
            </option>

            <option value="BOLETO">
              Boleto
            </option>

            <option value="CREDIT_LINE">
              Linha de crédito
            </option>

            <option value="AUTO_DEBIT">
              Débito automático
            </option>

          </select>

        </div>

        {/* CREDIT CARD CONFIG */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
        ">

          <div className="
            flex
            flex-col
            gap-2
          ">

            <label className="
              text-sm
              font-medium
              text-zinc-700
            ">
              Fechamento da fatura
            </label>

            <input
              type="number"

              name="closingDay"

              min="1"
              max="31"

              defaultValue={
                paymentMethod.closingDay
                ?? ''
              }

              placeholder="Ex: 5"

              className="
                border
                border-zinc-300
                rounded-2xl
                px-4
                py-3
                bg-white
                text-zinc-900
                outline-none
                transition
                focus:border-zinc-900
              "
            />

          </div>

          <div className="
            flex
            flex-col
            gap-2
          ">

            <label className="
              text-sm
              font-medium
              text-zinc-700
            ">
              Vencimento da fatura
            </label>

            <input
              type="number"

              name="dueDay"

              min="1"
              max="31"

              defaultValue={
                paymentMethod.dueDay
                ?? ''
              }

              placeholder="Ex: 12"

              className="
                border
                border-zinc-300
                rounded-2xl
                px-4
                py-3
                bg-white
                text-zinc-900
                outline-none
                transition
                focus:border-zinc-900
              "
            />

          </div>

        </div>

        {/* FLAGS */}

        <div className="
          space-y-4
        ">

          <label className="
            flex
            items-center
            gap-3
          ">

            <input
              type="checkbox"

              name="supportsInstallments"

              defaultChecked={
                paymentMethod
                  .supportsInstallments
              }
            />

            <span className="
              text-sm
              text-zinc-700
            ">
              Permite parcelamento
            </span>

          </label>

          <label className="
            flex
            items-center
            gap-3
          ">

            <input
              type="checkbox"

              name="requiresManualPayment"

              defaultChecked={
                paymentMethod
                  .requiresManualPayment
              }
            />

            <span className="
              text-sm
              text-zinc-700
            ">
              Requer pagamento manual
            </span>

          </label>

          <label className="
            flex
            items-center
            gap-3
          ">

            <input
              type="checkbox"

              name="isActive"

              defaultChecked={
                paymentMethod
                  .isActive
              }
            />

            <span className="
              text-sm
              text-zinc-700
            ">
              Método ativo
            </span>

          </label>

        </div>

        <button
          type="submit"

          className="
            bg-zinc-900
            text-white
            px-6
            py-3
            rounded-2xl
            hover:bg-zinc-800
            transition
            font-medium
          "
        >
          Salvar alterações
        </button>

      </form>

    </main>
  );
}