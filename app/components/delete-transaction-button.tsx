'use client';

import {
  useRouter,
} from 'next/navigation';

type Props = {
  transactionId: string;
};

export function
DeleteTransactionButton({
  transactionId,
}: Props) {

  const router =
    useRouter();

  async function
  handleDelete() {

    const confirmed =
      confirm(
        'Deseja excluir esta transação?'
      );

    if (!confirmed) {
      return;
    }

    await fetch(
      `/api/transactions/${transactionId}`,
      {
        method: 'DELETE',
      }
    );

    router.push(
      '/transactions'
    );

    router.refresh();
  }

  return (

    <button
      onClick={handleDelete}

      className="
        px-5
        py-3
        rounded-2xl
        bg-red-500
        text-white
        hover:bg-red-600
        transition
        font-medium
      "
    >
      Excluir
    </button>
  );
}