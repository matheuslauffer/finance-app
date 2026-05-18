import {
  deleteTransaction,
} from '@/services/delete-transaction';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function
DELETE(
  request: Request,

  { params }: Props
) {

  const { id } =
    await params;

  await deleteTransaction(
    id
  );

  return Response.json({
    success: true,
  });
}