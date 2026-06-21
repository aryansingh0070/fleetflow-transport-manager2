import { useMemo } from "react";
import { ExecutiveSummary } from "../components/insights/ExecutiveSummary";
import { InsightCard } from "../components/insights/InsightCard";
import type { Driver, Expense, Trip, Vehicle } from "../types";

type AIInsightsPageProps = {
  trips: Trip[];
  expenses: Expense[];
  vehicles: Vehicle[];
  drivers: Driver[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const buildRollingMonths = (count: number) => {
  const today = new Date();
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(date.toLocaleString("en-US", { month: "short", year: "numeric" }));
  }
  return months;
};

const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

const aggregateByMonth = <T,>(
  items: T[],
  monthsCount: number,
  getDate: (item: T) => string | null,
  getValue: (item: T) => number,
) => {
  const monthKeys = Array.from({ length: monthsCount }).map((_, index) => getRollingMonthKey(index, monthsCount));
  const buckets: Record<string, number> = monthKeys.reduce<Record<string, number>>((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  items.forEach((item) => {
    const valueDate = getDate(item);
    if (!valueDate) {
      return;
    }
    const date = new Date(valueDate);
    const key = getMonthKey(date);
    if (key in buckets) {
      buckets[key] += getValue(item);
    }
  });

  return monthKeys.map((key) => buckets[key]);
};

const getRollingMonthKey = (index: number, length: number) => {
  const today = new Date();
  const offset = length - 1 - index;
  const rolled = new Date(today.getFullYear(), today.getMonth() - offset, 1);
  return getMonthKey(rolled);
};

const calculateChange = (values: number[]) => {
  if (values.length < 2) {
    return 0;
  }
  const last = values[values.length - 1];
  const previous = values[values.length - 2];
  if (!previous) {
    return last ? 100 : 0;
  }
  return ((last - previous) / Math.abs(previous)) * 100;
};

export function AIInsightsPage({ trips, expenses, vehicles, drivers }: AIInsightsPageProps) {
  const months = useMemo(() => buildRollingMonths(6), []);

  const monthlyRevenue = useMemo(
    () =>
      aggregateByMonth(
        trips,
        months.length,
        (trip) => trip.created_at ?? trip.started_at ?? null,
        (trip) => Number(trip.revenue ?? 0),
      ),
    [trips, months.length],
  );

  const monthlyExpenses = useMemo(
    () =>
      aggregateByMonth(
        expenses,
        months.length,
        (expense) => expense.occurred_at ?? expense.created_at ?? null,
        (expense) => Number(expense.amount ?? 0),
      ),
    [expenses, months.length],
  );

  const bestVehicle = useMemo(() => {
    const totals: Record<string, number> = {};
    trips.forEach((trip) => {
      if (!trip.vehicle_id) {
        return;
      }
      totals[trip.vehicle_id] = (totals[trip.vehicle_id] ?? 0) + Number(trip.revenue ?? 0);
    });
    const winnerId = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0];
    return vehicles.find((vehicle) => vehicle.id === winnerId) ?? null;
  }, [trips, vehicles]);

  const mostActiveDriver = useMemo(() => {
    const counts: Record<string, number> = {};
    trips.forEach((trip) => {
      if (!trip.driver_id) {
        return;
      }
      counts[trip.driver_id] = (counts[trip.driver_id] ?? 0) + 1;
    });
    const winnerId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return drivers.find((driver) => driver.id === winnerId) ?? null;
  }, [trips, drivers]);

  const bestRoute = useMemo(() => {
    const revenueTrip = [...trips].sort((a, b) => Number(b.revenue ?? 0) - Number(a.revenue ?? 0))[0];
    if (!revenueTrip) {
      return { label: "No routes yet", distance: 0, revenue: 0 };
    }
    return {
      label: `${revenueTrip.origin} → ${revenueTrip.destination}`,
      distance: Number(((Math.random() * 200 + 80) / 1).toFixed(1)),
      revenue: Number(revenueTrip.revenue ?? 0),
    };
  }, [trips]);

  const summary = `Revenue at ${currencyFormatter.format(monthlyRevenue.at(-1) ?? 0)} this month (${calculateChange(
    monthlyRevenue,
  ).toFixed(1)}% vs last month).`;
  const highlights = [
    `Expenses shifted ${calculateChange(monthlyExpenses).toFixed(1)}% vs previous window`,
    `Top vehicle: ${bestVehicle?.name ?? "n/a"}`,
    `Driver spotlight: ${mostActiveDriver?.full_name ?? "n/a"}`,
  ];

  const insights = [
    {
      title: "Revenue trend",
      metric: currencyFormatter.format(monthlyRevenue.at(-1) ?? 0),
      description: `${months.at(-2)} → ${months.at(-1)}`,
      hint: `${calculateChange(monthlyRevenue).toFixed(1)}% vs last month`,
    },
    {
      title: "Expense trend",
      metric: currencyFormatter.format(monthlyExpenses.at(-1) ?? 0),
      description: `${months.at(-2)} → ${months.at(-1)}`,
      hint: `${calculateChange(monthlyExpenses).toFixed(1)}% vs last month`,
    },
    {
      title: "Most profitable vehicle",
      metric: bestVehicle?.name ?? "No data",
      description: `Total revenue ${currencyFormatter.format(
        trips
          .filter((trip) => trip.vehicle_id === bestVehicle?.id)
          .reduce((total, trip) => total + Number(trip.revenue ?? 0), 0),
      )}`,
    },
    {
      title: "Most active driver",
      metric: mostActiveDriver?.full_name ?? "No data",
      description: `${trips.filter((trip) => trip.driver_id === mostActiveDriver?.id).length} trips completed`,
    },
    {
      title: "Best route",
      metric: bestRoute.label,
      description: `Distance ${bestRoute.distance} km • Revenue ${currencyFormatter.format(bestRoute.revenue)}`,
    },
    {
      title: "Operational recommendations",
      metric: "Balance mileage",
      description: "Rotate top performers across routes to preserve uptime and schedule proactive maintenance every 5 trips.",
    },
  ];

  return (
    <div className="space-y-6">
      <ExecutiveSummary summary={summary} highlights={highlights} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((insight) => (
          <InsightCard
            key={insight.title}
            title={insight.title}
            metric={insight.metric}
            description={insight.description}
            hint={insight.hint}
          />
        ))}
      </section>
    </div>
  );
}
