import type { SummaryCard } from "../../types";

type KPIGridProps = {
  metrics: SummaryCard[];
};

export function KPIGrid({ metrics }: KPIGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
          <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
          <p className="text-sm text-slate-500">{metric.detail}</p>
        </div>
      ))}
    </div>
  );
}
