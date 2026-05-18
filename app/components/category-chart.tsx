'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#3b82f6',
  '#22c55e',
  '#ef4444',
  '#eab308',
  '#8b5cf6',
  '#f97316',
];

type CategoryChartProps = {
  data: {
    category: string;

    total: string | null;
  }[];
};

export function
CategoryChart({
  data,
}: CategoryChartProps) {

  const formattedData =
    data.map((item) => ({
      name: item.category,

      value:
        Number(item.total ?? 0),
    }));

  return (

    <div className="
      bg-white
      rounded-2xl
      p-6
      border
      shadow-sm
      h-[400px]
    ">

      <div className="mb-6">

        <h2 className="
          text-2xl
          font-bold
        ">
          Gastos por categoria
        </h2>

        <p className="
          text-zinc-500
        ">
          Distribuição financeira
        </p>

      </div>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <PieChart>

          <Pie
            data={formattedData}

            dataKey="value"

            nameKey="name"

            outerRadius={120}

            label
          >

            {
              formattedData.map(
                (_, index) => (

                  <Cell
                    key={index}

                    fill={
                      COLORS[
                        index %
                        COLORS.length
                      ]
                    }
                  />
                )
              )
            }

          </Pie>

          <Tooltip />

        </PieChart>

      </ResponsiveContainer>

    </div>
  );
}