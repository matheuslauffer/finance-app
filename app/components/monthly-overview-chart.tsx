'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
} from 'recharts';

type Props = {
  data: {
    referenceMonth: string;

    realized: number;

    projected: number;
  }[];
};

export function
MonthlyOverviewChart({
  data,
}: Props) {

  return (

    <div
      className="
        bg-white
        rounded-3xl
        p-6
        border
        border-zinc-200
        shadow-sm
        h-[360px]
        min-w-0
      "
    >

      <div className="
        mb-6
      ">

        <h2 className="
          text-2xl
          font-bold
          text-zinc-900
        ">
          Fluxo de caixa
        </h2>

        <p className="
          text-zinc-500
          mt-1
        ">
          Realizado vs previsto
        </p>

      </div>

      <ResponsiveContainer
        width="100%"
        height={260}
      >

        <AreaChart
          data={data}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="
              referenceMonth
            "
          />

          <Tooltip />

          <Area
            type="monotone"

            dataKey="
              realized
            "

            stroke="#18181b"

            fill="#18181b22"
          />

          <Area
            type="monotone"

            dataKey="
              projected
            "

            stroke="#a1a1aa"

            fill="#a1a1aa33"
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>
  );
}