import { lazy, Suspense, useMemo } from "react";
import { EntityListSection } from "../components/dashboard/EntityListSection";
import { KPIGrid } from "../components/dashboard/KPIGrid";
import { RolePlaybook } from "../components/dashboard/RolePlaybook";
import { TripStatsPanel } from "../components/dashboard/TripStatsPanel";
import { AnalyticsChart } from "../components/dashboard/AnalyticsChart";
import { ExpenseChart } from "../components/dashboard/ExpenseChart";
import { RevenueChart } from "../components/dashboard/RevenueChart";
import { OperationsPanel } from "../components/operations/OperationsPanel";
import { Skeleton } from "../components/ui/Skeleton";
import { useFleetTrends } from "../hooks/useFleetTrends";
import type { Driver, Expense, FleetRole, Trip, Vehicle } from "../types";

const FinancePanel = lazy(() => import("../components/finance/FinancePanel").then((mod) => ({ default: mod.FinancePanel })));

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

type DashboardPageProps = {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  expenses: Expense[];
  currentRole: FleetRole;
  statusMessage: string | null;
  errorMessage: string | null;
  dataLoading: boolean;
  onRefresh: () => Promise<void>;
};

export function DashboardPage({
  vehicles,
  drivers,
  trips,
  expenses,
  currentRole,
  statusMessage,
  errorMessage,
  dataLoading,
  onRefresh,
}: DashboardPageProps) {
  const { rollingMonths, monthDescriptors, monthlyRevenue, monthlyExpenses, monthlyTripCounts } = useFleetTrends(trips, expenses);
  const pendingTrips = useMemo(() => trips.filter((trip) => trip.status === "pending").length, [trips]);
  const assignedTrips = useMemo(() => trips.filter((trip) => trip.status === "assigned").length, [trips]);
  const inTransitTrips = useMemo(() => trips.filter((trip) => trip.status === "in_transit").length, [trips]);
  const completedTrips = useMemo(() => trips.filter((trip) => trip.status === "completed").length, [trips]);
  const cancelledTrips = useMemo(() => trips.filter((trip) => trip.status === "cancelled").length, [trips]);
  const vehiclesInService = useMemo(() => vehicles.filter((vehicle) => vehicle.status !== "available").length, [vehicles]);

  const revenueTotal = useMemo(() => monthlyRevenue.reduce((total, value) => total + value, 0), [monthlyRevenue]);
  const expenseTotal = useMemo(() => monthlyExpenses.reduce((total, value) => total + value, 0), [monthlyExpenses]);
  const statusDistribution = useMemo(
    () => {
      const totals: Record<string, number> = {};
      vehicles.forEach((vehicle) => {
        const key = vehicle.status ?? "unknown";
        totals[key] = (totals[key] ?? 0) + 1;
      });
      return Object.entries(totals).map(([status, count]) => ({ status, count }));
    },
    [vehicles],
  );
  const statusChartLabels = statusDistribution.map((entry) => entry.status);
  const statusChartValues = statusDistribution.map((entry) => entry.count);

  const kpiMetrics = useMemo(() => {
    const activeTrips = pendingTrips + assignedTrips + inTransitTrips;
    const netProfit = revenueTotal - expenseTotal;

    return [
      {
        label: "Fleet size",
        value: vehicles.length,
        detail: `${vehiclesInService} vehicles deployed`,
      },
      {
        label: "Active trips",
        value: activeTrips,
        detail: `${pendingTrips} pending • ${assignedTrips} assigned • ${inTransitTrips} in transit`,
      },
      {
        label: "Revenue",
        value: currencyFormatter.format(revenueTotal),
        detail: "Captured in Supabase ledger",
      },
      {
        label: "Net profit",
        value: currencyFormatter.format(netProfit),
        detail: "Revenue minus expenses",
      },
    ];
  }, [vehicles.length, vehiclesInService, pendingTrips, assignedTrips, inTransitTrips, revenueTotal, expenseTotal]);

  const tripStats = useMemo(
    () => ({
      total: trips.length,
      pending: pendingTrips,
      assigned: assignedTrips,
      inTransit: inTransitTrips,
      completed: completedTrips,
      cancelled: cancelledTrips,
    }),
    [trips.length, pendingTrips, assignedTrips, inTransitTrips, completedTrips, cancelledTrips],
  );

  return (
    <main className="space-y-6">
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Dashboard</p>
            <h2 className="text-2xl font-semibold text-slate-900">Live fleet health</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <p>{dataLoading ? "Refreshing fleet data…" : "Synchronized with Supabase"}</p>
            <button
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
              type="button"
              onClick={onRefresh}
              disabled={dataLoading}
            >
              Refresh
            </button>
          </div>
        </div>
        {(statusMessage || errorMessage) && (
          <div className="space-y-1 text-sm">
            {statusMessage && <p className="text-green-600">{statusMessage}</p>}
            {errorMessage && <p className="text-rose-500">{errorMessage}</p>}
          </div>
        )}
        {dataLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24" aria-label="Loading KPI" />
            ))}
          </div>
        ) : (
          <KPIGrid metrics={kpiMetrics} />
        )}
      </section>

      <RolePlaybook role={currentRole} />

      <section className="grid gap-6 lg:grid-cols-2">
        <TripStatsPanel {...tripStats} />
        <article className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Vehicles</p>
              <h3 className="text-xl font-semibold text-slate-900">Active roster</h3>
            </div>
            <p className="text-sm font-semibold text-slate-500">{vehicles.length}</p>
          </div>
          <div className="space-y-3 text-sm text-slate-500">
            {vehicles.slice(0, 4).map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{vehicle.name}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{vehicle.vehicle_number ?? vehicle.license_plate ?? "No plate"}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{vehicle.status}</span>
              </div>
            ))}
            {!vehicles.length && <p className="text-center">No vehicles have been onboarded yet.</p>}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RevenueChart labels={rollingMonths} values={monthlyRevenue} />
        <ExpenseChart labels={rollingMonths} values={monthlyExpenses} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChart
          chartType="bar"
          chartData={{
            labels: rollingMonths,
            datasets: [
              {
                label: "Trips",
                data: monthlyTripCounts,
                backgroundColor: "rgba(16, 185, 129, 0.7)",
                borderColor: "transparent",
              },
            ],
          }}
          title="Trips per month"
          description="Trips captured across each of the trailing six months."
          options={{
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                },
              },
            },
          }}
        />
        <AnalyticsChart
          chartType="doughnut"
          chartData={{
            labels: statusChartLabels,
            datasets: [
              {
                data: statusChartValues,
                backgroundColor: ["#6366F1", "#10B981", "#F97316", "#EF4444", "#0EA5E9"],
              },
            ],
          }}
          title="Vehicle utilization"
          description="Current status mix for the fleet roster."
          options={{
            plugins: {
              legend: {
                position: "right",
              },
            },
          }}
        />
      </section>

      {dataLoading ? (
        <Skeleton className="h-[420px]" aria-label="Loading finance panel" />
      ) : (
        <Suspense fallback={<Skeleton className="h-[420px]" aria-label="Loading finance panel" />}>
          <FinancePanel
            trips={trips}
            vehicles={vehicles}
            drivers={drivers}
            expenses={expenses}
            rollingMonths={monthDescriptors}
            monthlyRevenue={monthlyRevenue}
            monthlyExpenses={monthlyExpenses}
          />
        </Suspense>
      )}

      {dataLoading ? (
        <Skeleton className="h-[520px]" aria-label="Loading operations panel" />
      ) : (
        <OperationsPanel trips={trips} vehicles={vehicles} drivers={drivers} onRefresh={onRefresh} />
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <EntityListSection
          title="Driver roster"
          description="Assigned heroes"
          items={drivers}
          emptyMessage="No drivers are synced yet."
          keyExtractor={(driver) => driver.id}
          renderItem={(driver) => (
            <>
              <div>
                <p className="font-semibold text-slate-900">{driver.full_name}</p>
                <p className="text-xs text-slate-400">{driver.license_number ?? "No license on file"}</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{driver.status}</span>
            </>
          )}
        />

        <EntityListSection
          title="Expenses"
          description="Recent spend"
          items={expenses}
          emptyMessage="Expense trail is empty."
          keyExtractor={(expense) => expense.id}
          renderItem={(expense) => (
            <>
              <div>
                <p className="font-semibold text-slate-900">{expense.category}</p>
                <p className="text-xs text-slate-400">{expense.description ?? "No memo"}</p>
              </div>
              <span className="text-sm font-semibold text-slate-900">{currencyFormatter.format(expense.amount)}</span>
            </>
          )}
        />
      </section>
    </main>
  );
}
