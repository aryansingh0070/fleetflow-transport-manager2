import type { ChartData } from "chart.js";
import { useMemo } from "react";
import { AnalyticsChart } from "./AnalyticsChart";

type ExpenseChartProps = {
  labels: string[];
  values: number[];
};

export function ExpenseChart({ labels, values }: ExpenseChartProps) {
  const chartData = useMemo<ChartData<"line">>(() => ({
    labels,
    datasets: [
      {
        label: "Expenses",
        data: values,
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.15)",
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
      title="Monthly expenses"
      description="Expense trends over the trailing six-month window."
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
