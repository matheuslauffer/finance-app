type Props = {
  data: {
    category: string | null;

    total: number;
  }[];
};

export function
ExpensesByCategory({
  data,
}: Props) {

  const max =
    Math.max(
      ...data.map(
        (item) => item.total
      ),
      1
    );

  return (

    <div className="
      bg-white
      rounded-3xl
      border
      border-zinc-200
      p-6
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
          Maiores despesas
        </h2>

        <p className="
          text-zinc-500
          mt-1
        ">
          Distribuição por categoria
        </p>

      </div>

      <div className="
        space-y-5
      ">

        {
          data.map((item) => {

            const percentage =
              (
                item.total
                / max
              ) * 100;

            return (

              <div
                key={
                  item.category
                }
              >

                <div className="
                  flex
                  items-center
                  justify-between
                  mb-2
                ">

                  <p className="
                    font-medium
                    text-zinc-800
                  ">
                    {
                      item.category
                      ?? 'Sem categoria'
                    }
                  </p>

                  <p className="
                    text-sm
                    font-semibold
                    text-zinc-900
                  ">
                    R$
                    {
                      item.total
                        .toFixed(2)
                    }
                  </p>

                </div>

                <div className="
                  h-3
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
                        `${percentage}%`,
                    }}
                  />

                </div>

              </div>
            );
          })
        }

      </div>

    </div>
  );
}