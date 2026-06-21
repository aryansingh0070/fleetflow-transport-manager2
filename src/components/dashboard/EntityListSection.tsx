import type { ReactNode } from "react";

type EntityListSectionProps<T> = {
  title: string;
  description: string;
  items: T[];
  emptyMessage: string;
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
};

export function EntityListSection<T>({ title, description, items, emptyMessage, keyExtractor, renderItem }: EntityListSectionProps<T>) {
  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</p>
        <h3 className="text-xl font-semibold text-slate-900">{description}</h3>
      </div>
      <div className="space-y-3 text-sm text-slate-500">
        {items.slice(0, 4).map((item) => (
          <div key={keyExtractor(item)} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            {renderItem(item)}
          </div>
        ))}
        {!items.length && <p className="text-center">{emptyMessage}</p>}
      </div>
    </article>
  );
}
