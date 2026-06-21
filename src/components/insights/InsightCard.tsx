type InsightCardProps = {
  title: string;
  metric: string;
  description: string;
  hint?: string;
};

export function InsightCard({ title, metric, description, hint }: InsightCardProps) {
  return (
    <article className="space-y-1 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</p>
      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{metric}</p>
      <p className="text-sm text-slate-500 dark:text-slate-300">{description}</p>
      {hint && <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">{hint}</p>}
    </article>
  );
}
