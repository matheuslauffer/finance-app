import Link from 'next/link';

import {
  Sidebar,
} from '@/app/components/sidebar';

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

      <Sidebar />

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