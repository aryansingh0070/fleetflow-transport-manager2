import type { Expense, Trip } from "../types";

export function calculateTotalRevenue(trips: Trip[]) {
  return trips.reduce((sum, trip) => sum + Number(trip.revenue ?? 0), 0);
}

export function calculateTotalExpenses(expenses: Expense[]) {
  return expenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
}

export function calculateProfit(trips: Trip[], expenses: Expense[]) {
  return calculateTotalRevenue(trips) - calculateTotalExpenses(expenses);
}
