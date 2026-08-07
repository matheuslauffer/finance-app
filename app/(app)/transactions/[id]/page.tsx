import {
  DeleteTransactionButton,
} from '../../../components/delete-transaction-button';

import {
  getTransactionDetails,
} from '@/services/transaction-details-service';

import{
  formatCurrency,
} from '@/lib/currency'

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

  const details =
    await getTransactionDetails({

      transactionId:
        id,
    });

  if (!details) {

    return (

      <main className="
        p-10
      ">
        Transação não encontrada
      </main>
    );
  }

  const transaction =
    details.transaction;

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
              {
                formatCurrency(
                  Number(
                    transaction.amount
                  )
                )
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

            <p className={`
              font-medium
              uppercase
              tracking-wide

              ${
                transaction.transactionType
                === 'INCOME'

                  ? 'text-emerald-600'

                  : 'text-red-500'
              }
            `}>
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

          <div>

            <p className="
              text-sm
              text-zinc-500
              mb-1
            ">
              Data de cadastro
            </p>

            <p className="
              text-lg
              font-medium
              text-zinc-900
            ">
              {
                new Date(
                  transaction
                    .createdAt
                )
                  .toLocaleString(
                    'pt-BR',
                    {
                      dateStyle:
                        'short',
                      timeStyle:
                        'short',
                    }
                  )
              }
            </p>

          </div>

        </div>

      </div>

      {
        details.installmentPlan && (

          <div className="
            mt-8
            bg-white
            border
            border-zinc-200
            rounded-3xl
            p-8
            shadow-sm
          ">

            <div className="
              mb-6
            ">

              <h2 className="
                text-2xl
                font-bold
                text-zinc-900
              ">
                Parcelamento
              </h2>

              <p className="
                text-zinc-500
                mt-1
              ">
                {
                  details
                    .installmentPlan
                    .installmentCount
                }x de {

                  formatCurrency(
                    Number(
                      details
                        .installmentPlan
                        .installmentAmount
                    )
                  )
                }
              </p>

            </div>

            <div className="
              flex
              flex-col
              gap-3
            ">

              {
                details.installments.map(
                  (installment) => (

                    <div
                      key={installment.id}

                      className="
                        flex
                        items-center
                        justify-between
                        border
                        border-zinc-200
                        rounded-2xl
                        px-5
                        py-4
                      "
                    >

                      <div>

                        <p className="
                          font-semibold
                          text-zinc-900
                        ">
                          Parcela {

                            installment
                              .installmentNumber
                          }
                        </p>

                        <p className="
                          text-sm
                          text-zinc-500
                          mt-1
                        ">
                          Vencimento:
                          {' '}
                          {
                            installment
                              .dueDate
                          }
                        </p>

                      </div>

                      <div className="
                        text-right
                      ">

                        <p className="
                          font-bold
                          text-zinc-900
                        ">
                          {
                            formatCurrency(
                              Number(
                                installment.amount
                              )
                            )
                          }
                        </p>

                        <p className="
                          text-sm
                          text-amber-600
                          font-medium
                          mt-1
                        ">
                          {
                            installment.status
                          }
                        </p>

                      </div>

                    </div>
                  )
                )
              }

            </div>

          </div>
        )
      }

    </main>
  );
}