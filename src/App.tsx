import { lazy, Suspense, useState } from "react";
import { LoginPanel } from "./components/auth/LoginPanel";
import { Layout } from "./components/layout/Layout";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useFleetSession } from "./hooks/useFleetSession";
import type { FleetRole } from "./types";
import { ErrorBoundary } from "./components/ErrorBoundary";

const DashboardPage = lazy(() => import("./pages/DashboardPage").then((mod) => ({ default: mod.DashboardPage })));
const AIInsightsPage = lazy(() => import("./pages/AIInsightsPage").then((mod) => ({ default: mod.AIInsightsPage })));
const MapsExplorer = lazy(() => import("./pages/MapsExplorer").then((mod) => ({ default: mod.MapsExplorer })));
import type { SectionKey } from "./components/layout/Layout";


export default function App() {
  const {
    session,
    currentUser,
    vehicles,
    drivers,
    trips,
    expenses,
    authLoading,
    dataLoading,
    statusMessage,
    errorMessage,
    login,
    logout,
    refresh,
  } = useFleetSession();

  const currentRole = (currentUser?.role ?? "owner") as FleetRole;
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");

  const dashboardContent = (
    <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">Loading dashboard…</div>}>
      <DashboardPage
        vehicles={vehicles}
        drivers={drivers}
        trips={trips}
        expenses={expenses}
        currentRole={currentRole}
        statusMessage={statusMessage}
        errorMessage={errorMessage}
        dataLoading={dataLoading}
        onRefresh={refresh}
      />
    </Suspense>
  );

  const insightsContent = (
    <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">Preparing insights…</div>}>
      <AIInsightsPage trips={trips} expenses={expenses} vehicles={vehicles} drivers={drivers} />
    </Suspense>
  );

  const mapsContent = (
    <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">Loading maps…</div>}>
      <MapsExplorer vehicles={vehicles} trips={trips} />
    </Suspense>
  );

  const renderSection = () => {
    if (!session) {
      return (
        <div className="flex h-full flex-1 items-center justify-center">
          <LoginPanel loading={authLoading} statusMessage={statusMessage} errorMessage={errorMessage} onSubmit={login} />
        </div>
      );
    }

    if (activeSection === "insights") {
      return insightsContent;
    }

    if (activeSection === "maps") {
      return mapsContent;
    }

    return dashboardContent;
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <Layout
          authenticated={Boolean(session)}
          statusMessage={statusMessage}
          onLogout={logout}
          activeSection={activeSection}
          onNavigate={(section) => setActiveSection(section)}
        >
          <ErrorBoundary>{renderSection()}</ErrorBoundary>
        </Layout>
      </ToastProvider>
    </ThemeProvider>
  );
}
