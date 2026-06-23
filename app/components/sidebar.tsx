import Link from 'next/link';

export function
Sidebar() {

  return (

    <aside className="
      w-72
      bg-white
      border-r
      border-zinc-200
      p-6
      flex
      flex-col
      justify-between
    ">

      <div>

        {/* LOGO */}

        <div className="
          mb-10
        ">

          <h1 className="
            text-3xl
            font-bold
            text-zinc-900
          ">
            Finance App
          </h1>

          <p className="
            text-sm
            text-zinc-500
            mt-2
          ">
            Gestão financeira pessoal
          </p>

        </div>

        {/* NAVIGATION */}

        <nav className="
          flex
          flex-col
          gap-8
        ">

          {/* FINANCEIRO */}

          <div>

            <p className="
              text-xs
              font-semibold
              tracking-widest
              text-zinc-400
              mb-3
              px-3
            ">
              FINANCEIRO
            </p>

            <div className="
              flex
              flex-col
              gap-1
            ">

              <Link
                href="/dashboard"

                className="
                  p-3
                  rounded-2xl
                  hover:bg-zinc-100
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
                  rounded-2xl
                  hover:bg-zinc-100
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
                  rounded-2xl
                  hover:bg-zinc-100
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
                  rounded-2xl
                  hover:bg-zinc-100
                  transition
                  text-zinc-700
                  font-medium
                "
              >
                Recorrências
              </Link>

              <Link
                href="/projections"

                className="
                  p-3
                  rounded-2xl
                  hover:bg-zinc-100
                  transition
                  text-zinc-700
                  font-medium
                "
              >
                Projeções
              </Link>

            </div>

          </div>

          {/* GESTÃO */}

          <div>

            <p className="
              text-xs
              font-semibold
              tracking-widest
              text-zinc-400
              mb-3
              px-3
            ">
              GESTÃO
            </p>

            <div className="
              flex
              flex-col
              gap-1
            ">

              <Link
                href="/categories"

                className="
                  p-3
                  rounded-2xl
                  hover:bg-zinc-100
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
                  rounded-2xl
                  hover:bg-zinc-100
                  transition
                  text-zinc-700
                  font-medium
                "
              >
                Métodos de pagamento
              </Link>

            </div>

          </div>

          {/* SISTEMA */}

          <div>

            <p className="
              text-xs
              font-semibold
              tracking-widest
              text-zinc-400
              mb-3
              px-3
            ">
              SISTEMA
            </p>

            <div className="
              flex
              flex-col
              gap-1
            ">

              <Link
                href="/import"

                className="
                  p-3
                  rounded-2xl
                  hover:bg-zinc-100
                  transition
                  text-zinc-700
                  font-medium
                "
              >
                Importar
              </Link>

              <Link
                href="/profile"

                className="
                  p-3
                  rounded-2xl
                  hover:bg-zinc-100
                  transition
                  text-zinc-700
                  font-medium
                "
              >
                Perfil
              </Link>

            </div>

          </div>

        </nav>

      </div>

      {/* FOOTER */}

      <div className="
        pt-6
        border-t
        border-zinc-200
      ">

        <p className="
          text-xs
          text-zinc-400
          text-center
        ">
          Finance App © 2026
        </p>

      </div>

    </aside>
  );
}
