'use client';

import {
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

export function
GenerateRecurringTransactionsButton() {

  const router =
    useRouter();

  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] = useState<string | null>(
    null
  );

  async function
  handleGenerate() {

    setIsGenerating(
      true
    );

    setFeedback(
      null
    );

    const response =
      await fetch(
        '/api/recurring-transactions/generate',
        {
          method:
            'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify({}),
        }
      );

    if (!response.ok) {

      setFeedback(
        'Não foi possível gerar as recorrências.'
      );

      setIsGenerating(
        false
      );

      return;
    }

    const result =
      await response.json();

    setFeedback(
      `${result.createdCount} criada(s), ${result.skippedCount} já existente(s).`
    );

    setIsGenerating(
      false
    );

    router.refresh();
  }

  return (

    <div className="
      flex
      flex-col
      items-end
      gap-2
    ">

      <button
        type="button"

        onClick={handleGenerate}

        disabled={isGenerating}

        className="
          border
          border-zinc-300
          bg-white
          text-zinc-900
          px-5
          py-3
          rounded-2xl
          hover:bg-zinc-50
          transition
          font-medium
          disabled:opacity-60
          disabled:cursor-not-allowed
        "
      >
        {
          isGenerating
            ? 'Gerando...'
            : 'Gerar mês atual'
        }
      </button>

      {
        feedback && (

          <p className="
            text-xs
            text-zinc-500
          ">
            {feedback}
          </p>
        )
      }

    </div>
  );
}
