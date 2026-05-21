import {
  Sidebar,
} from '@/app/components/sidebar';

import {
  auth,
  currentUser,
} from '@clerk/nextjs/server';

import {
  ensureUserExists,
} from '@/services/user-service';

export default async function
AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  /*
  AUTH
  */

  const { userId } =
    await auth();

  /*
  SYNC USER
  */

  if (userId) {

    const clerkUser =
      await currentUser();

    if (clerkUser) {

      await ensureUserExists({

        id:
          clerkUser.id,

        email:
          clerkUser
            .emailAddresses?.[0]
            ?.emailAddress
          ?? '',

        name:
          clerkUser.fullName
          ?? 'Usuário',
      });
    }
  }

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