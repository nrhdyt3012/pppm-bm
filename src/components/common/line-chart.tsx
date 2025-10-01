import {
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Tooltip,
  XAxis,
} from "recharts";

export default function LineCharts({
  data,
}: {
  data: { name: string; total: number }[] | undefined;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart width={300} height={100} data={data}>
        <Tooltip wrapperClassName="!bg-white z-20 dark:!bg-neutral-900 rounded-md" />
        <Legend />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#00bba7"
          strokeWidth={2}
        />
        <XAxis dataKey="name" className="!hide !opacity-0" />
      </LineChart>
    </ResponsiveContainer>
  );
}
