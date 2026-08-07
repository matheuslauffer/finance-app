'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { loadMoreTransactions } from './actions';

type Transaction = Awaited<ReturnType<typeof loadMoreTransactions>>[0];

type Props = {
  initialTransactions: Transaction[];
  userId: string;
  search?: string;
  type?: 'INCOME' | 'EXPENSE';
  paymentMethodId?: string;
};

const LIMIT = 20;

function buildCursor(
  transaction: Transaction
) {
  return `${new Date(
    transaction.createdAt
  )
    .toISOString()}|${
    transaction.id
  }`;
}

export function TransactionsList({
  initialTransactions,
  userId,
  search,
  type,
  paymentMethodId,
}: Props) {
  const initialHasMore =
    initialTransactions.length > LIMIT;

  const initialVisible =
    initialHasMore
      ? initialTransactions.slice(
          0,
          LIMIT
        )
      : initialTransactions;

  const [transactions, setTransactions] =
    useState<Transaction[]>(
      initialVisible
    );

  const [isLoading, setIsLoading] =
    useState(false);

  const [hasMore, setHasMore] =
    useState(initialHasMore);

  const visibleTransactions =
    transactions;

  const [nextCursor, setNextCursor] =
    useState<string | null>(
      initialHasMore
        ? buildCursor(
            initialVisible[
              initialVisible.length - 1
            ]
          )
        : null
    );

  const loadMore = async () => {
    if (!nextCursor) {
      return;
    }

    setIsLoading(true);

    try {
      const newTransactions =
        await loadMoreTransactions({
          userId,
          search,
          transactionType: type,
          paymentMethodId,
          cursor: nextCursor,
        });

      const nextHasMore =
        newTransactions.length > LIMIT;

      const nextItems = nextHasMore
        ? newTransactions.slice(
            0,
            LIMIT
          )
        : newTransactions;

      setTransactions((prev) => {
        const merged = [
          ...prev,
          ...nextItems,
        ];

        const uniqueById = Array.from(
          new Map(
            merged.map((item) => [
              item.id,
              item,
            ])
          ).values()
        );

        return uniqueById;
      });

      setHasMore(nextHasMore);
      setNextCursor(
        nextHasMore
          ? buildCursor(
              nextItems[
                nextItems.length - 1
              ]
            )
          : null
      );
    } catch (error) {
      console.error(
        'Erro ao carregar mais transações:',
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="
      flex
      flex-col
      gap-4
    ">
      {visibleTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className="
            bg-white
            border
            border-zinc-200
            rounded-3xl
            p-6
            flex
            justify-between
            items-center
            hover:shadow-md
            transition
            hover:-translate-y-0.5
          "
        >
          <div>
            <Link
              href={
                `/transactions/${transaction.id}`
              }
            >
              <p className="
                text-lg
                font-semibold
                text-zinc-900
                hover:text-zinc-700
                transition
              ">
                {transaction.description}
              </p>
            </Link>

            <p className="
              text-sm
              text-emerald-600
              font-medium
              mt-1
            ">
              {transaction.status}
            </p>

            <p className="
              text-sm
              text-zinc-500
              mt-1
            ">
              Cadastrada em:{' '}
              {new Date(
                transaction.createdAt
              ).toLocaleDateString('pt-BR', {
                dateStyle: 'short',
              })}
            </p>

            <p className="
              text-sm
              text-zinc-500
              mt-1
            ">
              Ocorreu em:{' '}
              {new Date(
                transaction.occurredAt
              ).toLocaleDateString('pt-BR', {
                dateStyle: 'short',
              })}
            </p>
          </div>

          <div className="
            text-right
          ">
            <p
              className={`
                text-lg
                font-semibold
                ${
                  transaction.transactionType
                  === 'INCOME'
                    ? 'text-emerald-600'
                    : 'text-red-500'
                }
              `}
            >
              {transaction.transactionType
              === 'INCOME'
                ? '+ '
                : '- '}
              {formatCurrency(
                Number(transaction.amount)
              )}
            </p>

            <p
              className={`
                text-sm
                font-medium
                mt-1
                uppercase
                tracking-wide

                ${
                  transaction.transactionType
                  === 'INCOME'
                    ? 'text-emerald-600'
                    : 'text-red-500'
                }
              `}
            >
              {transaction.transactionType}
            </p>

            <div className="
              flex
              justify-end
              gap-4
              mt-3
            ">
              <Link
                href={`
                  /transactions/${transaction.id}/edit
                `}
                className="
                  text-sm
                  font-medium
                  text-zinc-700
                  hover:text-zinc-900
                "
              >
                Editar
              </Link>

              <form
                action={`
                  /api/transactions/${transaction.id}/delete
                `}
                method="POST"
              >
                <button
                  type="submit"
                  className="
                    text-sm
                    font-medium
                    text-red-700
                    hover:text-red-900
                  "
                >
                  Excluir
                </button>
              </form>
            </div>
          </div>
        </div>
      ))}

      {visibleTransactions.length ===
      0 && (
        <p className="
          text-center
          text-zinc-500
          py-8
        ">
          Nenhuma transação encontrada
        </p>
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoading}
          className="
            mt-6
            bg-zinc-900
            text-white
            px-6
            py-3
            rounded-2xl
            hover:bg-zinc-800
            transition
            font-medium
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {isLoading
            ? 'Carregando...'
            : 'Carregar mais'}
        </button>
      )}
    </div>
  );
}
