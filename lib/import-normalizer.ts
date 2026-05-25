import {
  ImportedTransaction,
} from '@/types/imported-transaction';

type SpreadsheetRow = {
  [key: string]:
    string
    | number
    | boolean
    | null
    | undefined;
};

function
parseExcelDate(
  value:
    string
    | number
    | boolean
    | null
    | undefined
) {

  if (!value) {
    return null;
  }
  if (
  typeof value ===
  'boolean'
) {

  return null;
}

  if (
    typeof value ===
    'number'
  ) {

    const excelEpoch =
      new Date(
        1899,
        11,
        30
      );

    const parsedDate =
      new Date(
        excelEpoch.getTime()
        +
        value *
        86400000
      );

    return parsedDate
      .toISOString()
      .split('T')[0];
  }

  return String(value);
}

export function
normalizeSpreadsheetRows(
  rows: SpreadsheetRow[]
): ImportedTransaction[] {

  return rows.map((row) => {

    return {

      description:
        String(
          row['Descrição'] ?? ''
        ),

      amount:
        Number(
          row['Valor Total'] ?? 0
        ),

      category:
        String(
          row['Categoria'] ?? ''
        ),

      paymentMethod:
        String(
          row[
            'Forma de Pagamento'
          ] ?? ''
        ),

      transactionDate:
        parseExcelDate(
            row['Data']
        ) ?? '',

      installmentCount:
        Number(
          row['Nº Parcelas']
          ?? 1
        ),

      installmentNumber:
        Number(
          row[
            'Parcela Atual'
          ] ?? 1
        ),

      installmentAmount:
        Number(
          row[
            'Valor da Parcela'
          ] ?? 0
        ),

      dueDate:
        parseExcelDate(
            row[
            'Vencimento Parcela'
            ]
        ),

      isRecurring:
        String(
          row['Recorrente']
        ).toLowerCase()
        === 'sim',
    };
  });
}