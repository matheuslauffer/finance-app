'use client';

import {
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

type Category = {
  id: string;

  name: string;

  parentCategoryId:
    string | null;

  isActive: boolean;
};

type Props = {
  categories: Category[];
};

export function
CategoryManager({
  categories,
}: Props) {

  const router =
    useRouter();

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    showOnlyActive,
    setShowOnlyActive,
  ] = useState(true);

  const [
    feedback,
    setFeedback,
  ] = useState<string | null>(
    null
  );

  const parentCategories =
    categories.filter(
      (category) => (
        !category.parentCategoryId
      )
    );

  const visibleParentCategories =
    parentCategories.filter(
      (category) => (
        !showOnlyActive
        || category.isActive
      )
    );

  const activeParentCategories =
    parentCategories.filter(
      (category) => (
        category.isActive
      )
    );

  const childCategoriesByParent =
    new Map<
      string,
      Category[]
    >();

  for (
    const category
    of categories
  ) {

    if (
      !category.parentCategoryId
    ) {

      continue;
    }

    if (
      showOnlyActive
      && !category.isActive
    ) {

      continue;
    }

    const children =
      childCategoriesByParent.get(
        category.parentCategoryId
      )
      ?? [];

    children.push(
      category
    );

    childCategoriesByParent.set(
      category.parentCategoryId,
      children
    );
  }

  async function
  createCategory(
    formData: FormData
  ) {

    const response =
      await fetch(
        '/api/categories',
        {
          method:
            'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify({

              name:
                formData.get(
                  'name'
                ),

              parentCategoryId:
                formData.get(
                  'parentCategoryId'
                )
                || null,
            }),
        }
      );

    if (
      response.status === 409
    ) {

      setFeedback(
        'Já existe uma categoria com esse nome neste nível.'
      );

      return false;
    }

    if (
      !response.ok
    ) {

      setFeedback(
        'Não foi possível salvar a categoria.'
      );

      return false;
    }

    setFeedback(
      null
    );

    router.refresh();

    return true;
  }

  async function
  handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setIsSaving(
      true
    );

    const created =
      await createCategory(
        new FormData(
          event.currentTarget
        )
      );

    setIsSaving(
      false
    );

    if (
      created
    ) {

      event
        .currentTarget
        .reset();
    }
  }

  async function
  handleSubcategorySubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    const created =
      await createCategory(
        new FormData(
          event.currentTarget
        )
      );

    if (
      created
    ) {

      event
        .currentTarget
        .reset();
    }
  }

  return (

    <div className="
      grid
      grid-cols-1
      xl:grid-cols-[420px_1fr]
      gap-8
      items-start
    ">

      <section className="
        bg-white
        border
        border-zinc-200
        rounded-3xl
        p-6
        shadow-sm
        space-y-6
      ">

        <form
          onSubmit={handleSubmit}

          className="
            space-y-4
          "
        >

          <div>

            <h2 className="
              text-2xl
              font-bold
              text-zinc-900
            ">
              Nova categoria
            </h2>

          </div>

          <div className="
            flex
            flex-col
            gap-2
          ">

            <label className="
              text-sm
              font-medium
              text-zinc-700
            ">
              Nome
            </label>

            <input
              name="name"

              required

              placeholder="Ex: Alimentação"

              className="
                border
                border-zinc-300
                rounded-2xl
                px-4
                py-3
                bg-white
                text-zinc-900
                outline-none
                focus:border-zinc-900
              "
            />

          </div>

          <div className="
            flex
            flex-col
            gap-2
          ">

            <label className="
              text-sm
              font-medium
              text-zinc-700
            ">
              Categoria principal
            </label>

            <select
              name="parentCategoryId"

              defaultValue=""

              className="
                border
                border-zinc-300
                rounded-2xl
                px-4
                py-3
                bg-white
                text-zinc-900
                outline-none
              "
            >

              <option value="">
                Nenhuma
              </option>

              {
                activeParentCategories.map(
                  (category) => (

                    <option
                      key={category.id}

                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )
              }

            </select>

          </div>

          {
            feedback && (

              <p className="
                text-sm
                font-medium
                text-red-600
              ">
                {feedback}
              </p>
            )
          }

          <button
            type="submit"

            disabled={isSaving}

            className="
              bg-zinc-900
              text-white
              px-6
              py-3
              rounded-2xl
              hover:bg-zinc-800
              transition
              font-medium
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {
              isSaving
                ? 'Salvando...'
                : 'Salvar categoria'
            }
          </button>

        </form>

      </section>

      <section className="
        bg-white
        border
        border-zinc-200
        rounded-3xl
        p-6
        shadow-sm
      ">

        <div className="
          flex
          items-center
          justify-between
          gap-4
          mb-6
        ">

          <div>

            <h2 className="
              text-2xl
              font-bold
              text-zinc-900
            ">
              Categorias
            </h2>

          </div>

          <label className="
            flex
            items-center
            gap-2
            text-sm
            font-medium
            text-zinc-700
          ">

            <input
              type="checkbox"

              checked={showOnlyActive}

              onChange={(event) => {

                setShowOnlyActive(
                  event.target.checked
                );
              }}

              className="
                h-4
                w-4
                accent-zinc-900
              "
            />

            Somente ativas
          </label>

        </div>

        <div className="
          flex
          flex-col
          gap-4
        ">

          {
            visibleParentCategories.map(
              (category) => {

                const children =
                  childCategoriesByParent.get(
                    category.id
                  )
                  ?? [];

                return (

                  <div
                    key={category.id}

                    className="
                      border
                      border-zinc-200
                      rounded-2xl
                      p-4
                    "
                  >

                    <div className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    ">

                      <div>

                        <div className="
                          flex
                          items-center
                          gap-2
                        ">

                          <p className="
                            font-semibold
                            text-zinc-900
                          ">
                            {category.name}
                          </p>

                          <span className={`
                            rounded-full
                            px-2
                            py-0.5
                            text-xs
                            font-medium

                            ${
                              category.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-zinc-200 text-zinc-600'
                            }
                          `}>
                            {
                              category.isActive
                                ? 'Ativa'
                                : 'Inativa'
                            }
                          </span>

                        </div>

                      </div>

                      <form
                        action={`/api/categories/${category.id}/toggle`}

                        method="POST"
                      >

                        <button
                          type="submit"

                          className="
                            text-sm
                            font-medium
                            text-zinc-700
                            hover:text-zinc-900
                          "
                        >
                          {
                            category.isActive
                              ? 'Desativar'
                              : 'Ativar'
                          }
                        </button>

                      </form>

                    </div>

                    {
                      children.length > 0
                        ? (

                          <div className="
                            flex
                            flex-wrap
                            gap-2
                            mt-3
                          ">

                            {
                              children.map(
                                (child) => (

                                  <div
                                    key={child.id}

                                    className={`
                                      rounded-full
                                      px-3
                                      py-1
                                      text-sm
                                      font-medium
                                      flex
                                      items-center
                                      gap-2

                                      ${
                                        child.isActive
                                          ? 'bg-zinc-100 text-zinc-700'
                                          : 'bg-zinc-200 text-zinc-500'
                                      }
                                    `}
                                  >
                                    <span>
                                      {child.name}
                                    </span>

                                    <form
                                      action={`/api/categories/${child.id}/toggle`}

                                      method="POST"
                                    >

                                      <button
                                        type="submit"

                                        className="
                                          text-xs
                                          underline
                                        "
                                      >
                                        {
                                          child.isActive
                                            ? 'desativar'
                                            : 'ativar'
                                        }
                                      </button>

                                    </form>

                                  </div>
                                )
                              )
                            }

                          </div>
                        )
                        : (

                          <p className="
                            text-sm
                            text-zinc-500
                            mt-2
                          ">
                            Sem subcategorias
                          </p>
                        )
                    }

                    {
                      category.isActive && (

                        <form
                          onSubmit={handleSubcategorySubmit}

                          className="
                            flex
                            flex-col
                            sm:flex-row
                            gap-3
                            mt-4
                          "
                        >

                          <input
                            type="hidden"

                            name="parentCategoryId"

                            value={category.id}
                          />

                          <input
                            name="name"

                            required

                            placeholder={`Nova subcategoria de ${category.name}`}

                            className="
                              flex-1
                              border
                              border-zinc-300
                              rounded-2xl
                              px-4
                              py-2
                              bg-white
                              text-zinc-900
                              outline-none
                              focus:border-zinc-900
                            "
                          />

                          <button
                            type="submit"

                            className="
                              border
                              border-zinc-300
                              bg-white
                              px-4
                              py-2
                              rounded-2xl
                              hover:bg-zinc-50
                              transition
                              font-medium
                              text-zinc-900
                            "
                          >
                            Adicionar
                          </button>

                        </form>
                      )
                    }

                  </div>
                );
              }
            )
          }

        </div>

      </section>

    </div>
  );
}
