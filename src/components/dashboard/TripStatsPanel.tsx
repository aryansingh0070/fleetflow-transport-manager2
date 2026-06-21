type TripStatsPanelProps = {
  total: number;
  pending: number;
  assigned: number;
  inTransit: number;
  completed: number;
  cancelled: number;
};

export function TripStatsPanel({ total, pending, assigned, inTransit, completed, cancelled }: TripStatsPanelProps) {
  const stats = [
    { label: "Pending", value: pending },
    { label: "Assigned", value: assigned },
    { label: "In transit", value: inTransit },
    { label: "Completed", value: completed },
    { label: "Cancelled", value: cancelled },
  ];

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Trip stats</p>
          <h3 className="text-xl font-semibold text-slate-900">Trip cadence</h3>
        </div>
        <p className="text-sm font-semibold text-slate-500">{total} total</p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center text-sm md:grid-cols-5">
        {stats.map((entry) => (
          <div key={entry.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{entry.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{entry.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
        Trip records are synced with Supabase for reporting and downstream exports; refresh as needed.
      </div>
    </article>
  );
}
