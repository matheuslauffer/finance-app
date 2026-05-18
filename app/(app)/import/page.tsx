'use client';

type SpreadsheetRow = {
  [key: string]:
    string
    | number
    | boolean
    | null
    | undefined;
};

import { useState }
  from 'react';

import * as XLSX
  from 'xlsx';

import {
  normalizeSpreadsheetRows,
} from '@/lib/import-normalizer';

import {
  ImportedTransaction,
} from '@/types/imported-transaction';

export default function
ImportPage() {

  const [rows,
    setRows] =
    useState<ImportedTransaction[]>([]);

  async function
  handleFileUpload(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];

    if (!file) return;

    const data =
      await file.arrayBuffer();

    const workbook =
      XLSX.read(data);

    const sheetName =
      workbook.SheetNames[0];

    const worksheet =
      workbook.Sheets[
        sheetName
      ];

    const json =
      XLSX.utils.sheet_to_json<SpreadsheetRow>(
        worksheet
      );

    console.log(json);

    const normalizedRows =
  normalizeSpreadsheetRows(
    json
  );


setRows(normalizedRows);
}

async function
handleImport() {

  await fetch(
    '/api/import',

    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify(
        rows
      ),
    }
  );

  alert(
    'Importação concluída'
  );
}

  return (

    <main className="
      max-w-7xl
        mx-auto
        p-10
    ">

      <div className="mb-8">

        <h1 className="
          text-4xl
          font-bold
          mb-2
          text-zinc-900
        ">
          Importar planilha
        </h1>

        <p className="
          text-zinc-500
        ">
          Faça upload da sua planilha
          financeira
        </p>

      </div>

      <div className="
        bg-white
        rounded-3xl
        border
        border-zinc-200
        p-6
        mb-8
        shadow-sm
      ">

        <input
          type="file"

          accept=".xlsx"

          onChange={
            handleFileUpload
          }
        />

      </div>

      {
        rows.length > 0 && (

          <div className="
            bg-white
            rounded-3xl
            border
            border-zinc-200
            shadow-sm
            overflow-auto
          ">

            <table className="
              w-full
              text-sm
            ">

              <thead className="
                border-b
                bg-zinc-50
                text-zinc-700
              ">

                <tr>

                  {
                    Object.keys(
                      rows[0]
                    ).map((key) => (

                      <th
                        key={key}

                        className="
                          text-left
                          p-3
                          font-semibold
                          hover:bg-zinc-50
                            transition
                        "
                      >
                        {key}
                      </th>
                    ))
                  }

                </tr>

              </thead>

              <tbody>

                {
                  rows.map(
                    (
                      row,
                      index
                    ) => (

                      <tr
                        key={index}

                        className="
                          border-b
                          hover:bg-zinc-50
                            transition
                        "
                      >

                        {
                          Object.values(
                            row
                          ).map(
                            (
                              value: SpreadsheetRow[string],
                              cellIndex
                            ) => (

                              <td
                                key={
                                  cellIndex
                                }

                                className="
                                   p-4
                                    text-zinc-700
                                    border-b
                                    border-zinc-100
                                "
                              >
                                {
                                  String(
                                    value
                                  )
                                }
                              </td>
                            )
                          )
                        }

                      </tr>
                    )
                  )
                }

              </tbody>

            </table>

          </div>
        )
      }

      <div className="
  mt-6
  flex
  justify-end
">

  <button
    onClick={handleImport}

    className="
      bg-black
      text-white
      px-6
      py-3
      rounded-xl
      font-medium
    "
  >
    Importar dados
  </button>

</div>

    </main>
  );
}