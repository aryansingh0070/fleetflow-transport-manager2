type ExecutiveSummaryProps = {
  summary: string;
  highlights: string[];
};

export function ExecutiveSummary({ summary, highlights }: ExecutiveSummaryProps) {
  return (
    <section className="space-y-3 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200 dark:border-slate-800 dark:bg-slate-900/80">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Executive summary</p>
      <p className="text-xl font-semibold text-slate-900 dark:text-white">{summary}</p>
      <div className="space-y-1 text-sm text-slate-500 dark:text-slate-300">
        {highlights.map((item) => (
          <p key={item} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden />
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}
