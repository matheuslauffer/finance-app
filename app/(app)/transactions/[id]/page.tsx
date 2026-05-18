import {
  getTransactionById,
} from '@/services/get-transaction-by-id';

import {
  DeleteTransactionButton,
} from '../../../components/delete-transaction-button';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function
TransactionDetailsPage({
  params,
}: Props) {

  const { id } =
    await params;

  const transaction =
    await getTransactionById(
      id
    );

  if (!transaction) {

    return (
      <main className="
        p-10
      ">
        Transação não encontrada
      </main>
    );
  }

  return (

    <main className="
      max-w-5xl
      mx-auto
      p-10
    ">

      <div className="
        mb-8
        flex
        items-start
        justify-between
        gap-6
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
            text-zinc-900
          ">
            {
              transaction.description
            }
          </h1>

          <p className="
            text-zinc-500
            mt-2
          ">
            Detalhes da transação
          </p>

        </div>

        <div className="
          flex
          gap-3
        ">

          <a
            href={
                `/transactions/${transaction.id}/edit`
            }

            className="
                px-5
                py-3
                rounded-2xl
                border
                border-zinc-200
                bg-white
                hover:bg-zinc-50
                transition
                font-medium
            "
            >
            Editar
            </a>

          <DeleteTransactionButton
            transactionId={
                transaction.id
            }
            />

        </div>

      </div>

      <div className="
        bg-white
        border
        border-zinc-200
        rounded-3xl
        p-8
        shadow-sm
        space-y-8
      ">

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-8
        ">

          <div>

            <p className="
              text-sm
              text-zinc-500
              mb-1
            ">
              Valor
            </p>

            <p className="
              text-3xl
              font-bold
              text-zinc-900
            ">
              R$
              {
                transaction.amount
              }
            </p>

          </div>

          <div>

            <p className="
              text-sm
              text-zinc-500
              mb-1
            ">
              Categoria
            </p>

            <p className="
              text-lg
              font-medium
              text-zinc-900
            ">
              {
                transaction.categoryName
              }
            </p>

          </div>

          <div>

            <p className="
              text-sm
              text-zinc-500
              mb-1
            ">
              Método pagamento
            </p>

            <p className="
              text-lg
              font-medium
              text-zinc-900
            ">
              {
                transaction
                  .paymentMethodName
              }
            </p>

          </div>

          <div>

            <p className="
              text-sm
              text-zinc-500
              mb-1
            ">
              Status
            </p>

            <p className="
              text-emerald-600
              font-medium
            ">
              {
                transaction.status
              }
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
              text-red-500
              font-medium
              uppercase
              tracking-wide
            ">
              {
                transaction
                  .transactionType
              }
            </p>

          </div>

          <div>

            <p className="
              text-sm
              text-zinc-500
              mb-1
            ">
              Data efetiva
            </p>

            <p className="
              text-lg
              font-medium
              text-zinc-900
            ">
              {
                transaction
                  .effectiveDate
              }
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}