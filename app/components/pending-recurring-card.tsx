type Props = {

  items: {

    recurringTransactionId:
      string;

    description:
      string;

    projectedOccurrences:
      number;

    realizedOccurrences:
      number;

    remainingOccurrences:
      number;

    projectedTotal:
      number;

    realizedTotal:
      number;

    remainingTotal:
      number;

  }[];
};

export function
PendingRecurringCard({
  items,
}: Props) {

  return (

    <div
      className="
        bg-white
        rounded-3xl
        border
        border-zinc-200
        p-6
        shadow-sm
      "
    >

      <div className="
        mb-6
      ">

        <h2 className="
          text-2xl
          font-bold
          text-zinc-900
        ">
          Compromissos do mês
        </h2>

        <p className="
          text-zinc-500
          mt-1
        ">
          Previsto vs realizado
        </p>

      </div>

      <div className="
        space-y-5
      ">

        {
          items.map(
            (item) => {

              const progress =

                item
                  .projectedOccurrences

                > 0

                  ? (
                      item
                        .realizedOccurrences

                      /

                      item
                        .projectedOccurrences
                    ) * 100

                  : 0;

              return (

                <div
                  key={
                    item
                      .recurringTransactionId
                  }

                  className="
                    border
                    border-zinc-100
                    rounded-2xl
                    p-4
                  "
                >

                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  ">

                    <div>

                      <h3 className="
                        font-semibold
                        text-zinc-900
                      ">
                        {
                          item
                            .description
                        }
                      </h3>

                      <p className="
                        text-sm
                        text-zinc-500
                        mt-1
                      ">

                        {
                          item
                            .realizedOccurrences
                        }

                        /

                        {
                          item
                            .projectedOccurrences
                        }

                        {' '}
                        ocorrências

                      </p>

                    </div>

                    <div className="
                      text-right
                    ">

                      <p className="
                        text-sm
                        text-zinc-500
                      ">
                        Pendente
                      </p>

                      <p className="
                        font-bold
                        text-zinc-900
                      ">

                        {
                          item
                            .remainingTotal
                            .toLocaleString(
                              'pt-BR',
                              {

                                style:
                                  'currency',

                                currency:
                                  'BRL',
                              }
                            )
                        }

                      </p>

                    </div>

                  </div>

                  <div className="
                    mt-4
                  ">

                    <div className="
                      h-2
                      bg-zinc-100
                      rounded-full
                      overflow-hidden
                    ">

                      <div
                        className="
                          h-full
                          bg-zinc-900
                          rounded-full
                          transition-all
                        "

                        style={{
                          width:
                            `${progress}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>
              );
            }
          )
        }

      </div>

    </div>
  );
}