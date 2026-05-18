'use client';

import {
  useFormStatus,
} from 'react-dom';

type Props = {
  label: string;
};

export function
SubmitButton({
  label,
}: Props) {

  const {
    pending,
  } = useFormStatus();

  return (

    <button
      type="submit"

      disabled={pending}

      className={`
        px-6
        py-3
        rounded-2xl
        transition
        font-medium
        shadow-sm

        ${
          pending

            ? `
              bg-zinc-400
              text-white
              cursor-not-allowed
            `

            : `
              bg-zinc-900
              text-white
              hover:bg-zinc-800
            `
        }
      `}
    >

      {
        pending

          ? 'Salvando...'

          : label
      }

    </button>
  );
}