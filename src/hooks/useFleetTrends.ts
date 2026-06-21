import { useMemo } from "react";
import type { Expense, Trip } from "../types";

type FleetTrends = {
  rollingMonths: string[];
  monthDescriptors: { key: string; label: string }[];
  monthKeys: string[];
  monthlyRevenue: number[];
  monthlyExpenses: number[];
  monthlyTripCounts: number[];
};

const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

const buildRollingMonths = (count: number): { label: string; key: string }[] => {
  const today = new Date();
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (count - 1 - index), 1);
    return {
      label: date.toLocaleString("en-US", { month: "short", year: "numeric" }),
      key: getMonthKey(date),
    };
  });
};

const aggregateMonthly = <T,>(
  items: T[],
  monthKeys: string[],
  getDate: (item: T) => string | null,
  getValue: (item: T) => number,
) => {
  const buckets: Record<string, number> = {};
  monthKeys.forEach((key) => {
    buckets[key] = 0;
  });

  items.forEach((item) => {
    const rawDate = getDate(item);
    if (!rawDate) {
      return;
    }
    const key = getMonthKey(new Date(rawDate));
    if (key in buckets) {
      buckets[key] += getValue(item);
    }
  });

  return monthKeys.map((key) => buckets[key]);
};

export function useFleetTrends(trips: Trip[], expenses: Expense[], monthsCount = 6): FleetTrends {
  const { monthDescriptors, monthKeys } = useMemo(() => {
    const list = buildRollingMonths(monthsCount);
    return {
      monthDescriptors: list,
      monthKeys: list.map((item) => item.key),
    };
  }, [monthsCount]);

  const rollingMonths = useMemo(() => monthDescriptors.map((item) => item.label), [monthDescriptors]);

  const monthlyRevenue = useMemo(
    () => aggregateMonthly(trips, monthKeys, (trip) => trip.created_at ?? trip.started_at ?? null, (trip) => Number(trip.revenue ?? 0)),
    [trips, monthKeys],
  );

  const monthlyExpenses = useMemo(
    () => aggregateMonthly(expenses, monthKeys, (expense) => expense.occurred_at ?? expense.created_at ?? null, (expense) => Number(expense.amount ?? 0)),
    [expenses, monthKeys],
  );

  const monthlyTripCounts = useMemo(
    () => aggregateMonthly(trips, monthKeys, (trip) => trip.created_at ?? trip.started_at ?? null, () => 1),
    [trips, monthKeys],
  );

  return { rollingMonths, monthDescriptors, monthKeys, monthlyRevenue, monthlyExpenses, monthlyTripCounts };
}
