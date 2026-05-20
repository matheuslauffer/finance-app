import {
  auth,
} from '@clerk/nextjs/server';

import {
  redirect,
} from 'next/navigation';

import {
  CategoryManager,
} from '@/app/components/category-manager';

import {
  getCategories,
} from '@/services/category-service';

export default async function
CategoriesPage() {

  const session =
    await auth();

  const userId =
    session.userId;

  if (!userId) {

    redirect('/sign-in');
  }

  const categories =
    await getCategories(
      userId
    );

  return (

    <main className="
      p-10
      bg-[#f5f6f8]
      min-h-screen
    ">

      <div className="
        mb-8
      ">

        <h1 className="
          text-4xl
          font-bold
          text-zinc-900
        ">
          Categorias
        </h1>

        <p className="
          text-zinc-500
          mt-2
        ">
          Organize suas despesas por categoria e subcategoria
        </p>

      </div>

      <CategoryManager
        categories={categories}
      />

    </main>
  );
}
