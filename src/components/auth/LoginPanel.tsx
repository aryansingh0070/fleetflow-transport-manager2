import { FormEvent, useState } from "react";

type LoginPanelProps = {
  loading: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  onSubmit: (email: string, password: string) => void;
};

export function LoginPanel({ loading, statusMessage, errorMessage, onSubmit }: LoginPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(email.trim(), password);
  };

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Supabase auth</p>
        <h2 className="text-2xl font-semibold text-slate-900">Secure login for every role</h2>
        <p className="text-sm text-slate-500">Use credentials from your Supabase project or invite new operators via the Supabase console.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1 text-sm font-semibold text-slate-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
            placeholder="role@fleetflow.test"
          />
        </label>
        <label className="block space-y-1 text-sm font-semibold text-slate-700">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
            placeholder="Supabase password"
          />
        </label>
        <button
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Continue with Supabase"}
        </button>
      </form>
      {statusMessage && <p className="text-sm text-green-600">{statusMessage}</p>}
      {errorMessage && <p className="text-sm text-rose-500">{errorMessage}</p>}
      <p className="text-xs text-slate-400">
        Need to bootstrap data? See MIGRATION.md for steps to move data from LocalStorage into Supabase tables.
      </p>
    </section>
  );
}
