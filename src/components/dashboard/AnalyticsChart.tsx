import { useMemo } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  ChartType,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);
 
type AnalyticsChartProps<T extends ChartType> = {
   title: string;
   description: string;
   chartType: T;
   chartData: ChartData<T>;
   options?: ChartOptions<T>;
 };
 
 const defaultChartOptions: ChartOptions<ChartType> = {
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
     legend: {
       position: "bottom",
       labels: {
         boxWidth: 12,
         padding: 12,
       },
     },
   },
 };
 
 export function AnalyticsChart<T extends ChartType>({ title, description, chartType, chartData, options }: AnalyticsChartProps<T>) {
  const mergedOptions = useMemo(() => {
    const plugins = {
      ...defaultChartOptions.plugins,
      ...options?.plugins,
    };

    return {
      ...defaultChartOptions,
      ...options,
      plugins,
    };
  }, [options]) as ChartOptions<T>;

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Analytics</p>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="h-80">
        <Chart type={chartType} data={chartData} options={mergedOptions} />
      </div>
    </section>
  );
}
