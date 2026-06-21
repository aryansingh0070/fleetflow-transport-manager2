import type { ChartData } from "chart.js";
import { useMemo } from "react";
import { AnalyticsChart } from "./AnalyticsChart";

type RevenueChartProps = {
  labels: string[];
  values: number[];
};

export function RevenueChart({ labels, values }: RevenueChartProps) {
  const chartData = useMemo<ChartData<"line">>(() => ({
    labels,
    datasets: [
      {
        label: "Revenue",
        data: values,
        borderColor: "rgba(79, 70, 229, 1)",
        backgroundColor: "rgba(79, 70, 229, 0.15)",
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }), [labels, values]);

  return (
    <AnalyticsChart
      chartType="line"
      chartData={chartData}
      title="Monthly revenue"
      description="Revenue performance across the trailing six months."
      options={{
        scales: {
          y: {
            ticks: {
              callback: (value) => `$${value}`,
            },
          },
        },
      }}
    />
  );
}
