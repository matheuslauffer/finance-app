import {
  auth,
} from '@clerk/nextjs/server';

import {
  NextResponse,
} from 'next/server';

import {
  updatePaymentMethod,
} from '@/services/update-payment-method-service';

type Props = {

  params: Promise<{
    id: string;
  }>;
};

export async function
POST(
  request: Request,
  { params }: Props
) {

  const session =
    await auth();

  if (!session.userId) {

    return NextResponse.json(

      {
        error:
          'Unauthorized',
      },

      {
        status: 401,
      }
    );
  }

  const {
    id,
  } = await params;

  const formData =
    await request.formData();

  await updatePaymentMethod({

    id,

    userId:
      session.userId,

    name: formData.get('name') as string,

    methodType: formData.get('methodType') as 
        | 'PIX'
        | 'DEBIT'
        | 'CREDIT_CARD'
        | 'BOLETO'
        | 'BANK_TRANSFER'
        | 'CREDIT_LINE'
        | 'AUTO_DEBIT',

    closingDay:
      formData.get('closingDay')

        ? Number(
            formData.get(
              'closingDay'
            )
          )

        : null,

    dueDay:
      formData.get('dueDay')

        ? Number(
            formData.get(
              'dueDay'
            )
          )

        : null,

    supportsInstallments:
      formData.get(
        'supportsInstallments'
      ) === 'on',

    requiresManualPayment:
      formData.get(
        'requiresManualPayment'
      ) === 'on',

    isActive:
      formData.get(
        'isActive'
      ) === 'on',
  });

  return NextResponse.redirect(
    new URL(
      '/payment-methods',
      request.url
    )
  );
}