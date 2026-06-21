import { useMemo, useState } from "react";
import { useThemePreference } from "../../context/ThemeContext";

const navItems = [
  { label: "Dashboard", description: "Analytics home", key: "dashboard" },
  { label: "Operations", description: "Trips, vehicles, drivers", key: "operations" },
  { label: "Finance", description: "Revenue & exports", key: "finance" },
  { label: "AI Insights", description: "Business intelligence", key: "insights" },
  { label: "Maps", description: "Fleet & routes", key: "maps" },
];

export type SectionKey = (typeof navItems)[number]["key"];

type LayoutProps = {
  children: React.ReactNode;
  authenticated: boolean;
  statusMessage?: string | null;
  onLogout?: () => void;
  activeSection?: SectionKey;
  onNavigate?: (section: SectionKey) => void;
};

export function Layout({ children, authenticated, statusMessage, onLogout, activeSection = "dashboard", onNavigate }: LayoutProps) {
  const { theme, toggleTheme } = useThemePreference();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarWidth = sidebarCollapsed ? "w-20" : "w-64";

  const navList = useMemo(() => navItems, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex">
        <aside
          className={`hidden flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex ${sidebarWidth}`}
          aria-label="Primary"
        >
          <div className="flex h-20 items-center justify-between px-4">
            {!sidebarCollapsed && <span className="text-lg font-semibold">FleetFlow</span>}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="rounded-full border border-slate-200 p-1 text-slate-500 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? "→" : "←"}
            </button>
          </div>
          <nav className="space-y-1 px-2 pb-6">
            {navList.map((item) => {
              const isActive = item.key === activeSection;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate?.(item.key)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium leading-tight transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${isActive ? "bg-indigo-500" : "bg-slate-300"}`}
                    aria-hidden
                  />
                  {!sidebarCollapsed && (
                    <div>
                      <p>{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="rounded-2xl border border-transparent p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-100 lg:hidden"
                aria-label="Open navigation menu"
              >
                <span aria-hidden>☰</span>
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">FleetFlow</p>
                <h1 className="text-lg font-semibold">Operations console</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {statusMessage && (
                <p role="status" aria-live="polite" className="text-xs text-emerald-600 dark:text-emerald-300">
                  {statusMessage}
                </p>
              )}
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-2xl border border-slate-200 px-3 py-1 text-sm font-semibold leading-tight text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              {authenticated && typeof onLogout === "function" && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-2xl border border-rose-200 px-3 py-1 text-sm font-semibold leading-tight text-rose-600 transition hover:border-rose-300"
                  aria-label="Logout"
                >
                  Logout
                </button>
              )}
            </div>
          </header>
          {authenticated ? (
            <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">{children}</main>
          ) : (
            <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
          )}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="relative flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">FleetFlow</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-slate-500 transition hover:text-slate-900 dark:text-slate-400"
                aria-label="Close navigation"
              >
                ✕
              </button>
            </div>
            <nav className="mt-4 space-y-2">
              {navList.map((item) => {
                const isActive = item.key === activeSection;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      onNavigate?.(item.key);
                      setDrawerOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${isActive ? "bg-indigo-500" : "bg-slate-300"}`} aria-hidden />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
