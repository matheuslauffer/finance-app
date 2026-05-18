type DashboardCardProps = {
  title: string;

  value: string;

  subtitle?: string;
};

export function DashboardCard({
  title,
  value,
  subtitle,
}: DashboardCardProps) {

  return (

    <div className="
      bg-white
      rounded-3xl
      p-6
      border
      border-zinc-200
      shadow-sm
    ">

      <p className="
        text-sm
        font-bold
        text-zinc-500
        mb-2
      ">
        {title}
      </p>

      <h2 className="
        text-3xl
        font-bold
        text-zinc-900
      ">
        {value}
      </h2>

      {
        subtitle && (

          <p className="
            text-sm
            text-zinc-400
            mt-3
          ">
            {subtitle}
          </p>
        )
      }

    </div>
  );
}