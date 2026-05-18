import {
  updateTransaction,
} from '@/services/update-transaction';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function
PATCH(
  request: Request,

  { params }: Props
) {

  const body =
    await request.json();

  const { id } =
    await params;

  await updateTransaction({

    id,

    description:
      body.description,

    amount:
      body.amount,
  });

  return Response.json({
    success: true,
  });
}