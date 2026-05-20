import Link from 'next/link';

export function
Sidebar() {

  return (

    <aside className="
      w-64
      bg-white
      border-r
      p-6
      flex
      flex-col
      border-zinc-200
    ">

      <h1 className="
        text-2xl
        font-bold
        mb-10
        text-zinc-900
      ">
        Finance App
      </h1>

      <nav className="
        flex
        flex-col
        gap-2
      ">

        <Link
          href="/dashboard"

          className="
            p-3
            rounded-xl
            hover:bg-zinc-50
            transition
            text-zinc-700
            font-medium
          "
        >
          Dashboard
        </Link>

        <Link
          href="/transactions"

          className="
            p-3
            rounded-xl
            hover:bg-zinc-50
            transition
            text-zinc-700
            font-medium
          "
        >
          Transações
        </Link>

        <Link
          href="/transactions/new"

          className="
            p-3
            rounded-xl
            hover:bg-zinc-50
            transition
            text-zinc-700
            font-medium
          "
        >
          Nova transação
        </Link>

        <Link
          href="/recurring-transactions"

          className="
            p-3
            rounded-xl
            hover:bg-zinc-50
            transition
            text-zinc-700
            font-medium
          "
        >
          Recorrências
        </Link>

        <Link
          href="/categories"

          className="
            p-3
            rounded-xl
            hover:bg-zinc-50
            transition
            text-zinc-700
            font-medium
          "
        >
          Categorias
        </Link>

        <Link
          href="/payment-methods"

          className="
            p-3
            rounded-xl
            hover:bg-zinc-50
            transition
            text-zinc-700
            font-medium
          "
        >
          Métodos de pagamento
        </Link>

      </nav>

    </aside>
  );
}
