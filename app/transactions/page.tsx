import { Transaction }
  from '../../types/transaction';

async function
getTransactions() {

  const response =
    await fetch(
      'http://localhost:3000/api/transactions',
      {
        cache: 'no-store',
      }
    );

  return response.json();
}

export default async function
TransactionsPage() {

  const transactions =
    await getTransactions();

  return (

    <main className="p-10">

      <div className="
        flex
        items-center
        justify-between
        mb-8
      ">

        <h1 className="
          text-3xl
          font-bold
        ">
          Transações
        </h1>

        <a
          href="/transactions/new"

          className="
            bg-black
            text-white
            px-4
            py-2
            rounded-xl
          "
        >
          Nova transação
        </a>

      </div>

      <div className="flex flex-col gap-4">

        {
          transactions.map(
            (transaction: Transaction) => (

              <div
                key={transaction.id}

                className="
                  border
                  rounded-xl
                  p-4
                  flex
                  justify-between
                  items-center
                "
              >

                <div>

                  <p className="
                    font-bold
                  ">
                    {
                      transaction.description
                    }
                  </p>

                  <p className="
                    text-sm
                    opacity-70
                  ">
                    {
                      transaction.status
                    }
                  </p>

                </div>

                <div className="
                  text-right
                ">

                  <p className="
                    text-xl
                    font-bold
                  ">
                    R$
                    {transaction.amount}
                  </p>

                  <p className="
                    text-sm
                    opacity-70
                  ">
                    {
                      transaction.transactionType
                    }
                  </p>

                </div>

              </div>
            )
          )
        }

      </div>

    </main>
  );
}