import Link from 'next/link';

export default function
AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <div className="
      min-h-screen
      flex
      bg-[#f5f6f8]
    ">

      {/* SIDEBAR */}

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

        </nav>

      </aside>

      {/* CONTENT */}

      <div className="
        flex-1
        flex
        flex-col
      ">

        {/* HEADER */}

        <header className="
          h-16
          bg-white
          border-b
            shadow-sm
          px-6
          flex
          items-center
          justify-end
        ">

        </header>

        {/* PAGE */}

        <main className="
          flex-1
          p-10
        ">

          {children}

        </main>

      </div>

    </div>
  );
}