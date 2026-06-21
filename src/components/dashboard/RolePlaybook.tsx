import type { FleetRole } from "../../types";
import { rolePlaybooks } from "../../lib/rolePlaybooks";

type RolePlaybookProps = {
  role: FleetRole;
};

export function RolePlaybook({ role }: RolePlaybookProps) {
  const playbook = rolePlaybooks[role];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Role playbook</p>
          <h3 className="text-xl font-semibold text-slate-900">{playbook.title}</h3>
          <p className="text-sm text-slate-500">{playbook.description}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          {role}
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-500">
        {playbook.actions.map((action) => (
          <li key={action} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {action}
          </li>
        ))}
      </ul>
    </section>
  );
}
