import {
  getTransactionById,
} from '@/services/get-transaction-by-id';

import {
  EditTransactionForm,
} from '../../../.././components/edit-transaction-form';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function
EditTransactionPage({
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
      max-w-3xl
      mx-auto
      p-10
    ">

      <div className="
        mb-8
      ">

        <h1 className="
          text-4xl
          font-bold
          text-zinc-900
        ">
          Editar transação
        </h1>

        <p className="
          text-zinc-500
          mt-2
        ">
          Atualize os dados da movimentação
        </p>

      </div>

      <EditTransactionForm
        transaction={
          transaction
        }
      />

    </main>
  );
}