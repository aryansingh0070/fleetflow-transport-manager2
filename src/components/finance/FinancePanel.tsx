import { useMemo } from "react";
import { jsPDF } from "jspdf";
import { utils, writeFile } from "xlsx";
import type { Driver, Expense, Trip, Vehicle } from "../../types";

type FinancePanelProps = {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  expenses: Expense[];
  rollingMonths: { key: string; label: string }[];
  monthlyRevenue: number[];
  monthlyExpenses: number[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const exportToExcel = (data: Record<string, unknown>[], filename: string) => {
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Sheet1");
  writeFile(workbook, `${filename}.xlsx`);
};

const generateTripInvoicePDF = (trips: Trip[]) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("FleetFlow Trip Invoices", 14, 20);
  doc.setFontSize(11);
  const header = ["Origin", "Destination", "Driver", "Vehicle", "Revenue"];
  doc.text(header.join(" | "), 14, 32);
  trips.slice(0, 7).forEach((trip, index) => {
    const line = [
      trip.origin,
      trip.destination,
      trip.driver_id ?? "Unassigned",
      trip.vehicle_id ?? "Unassigned",
      currencyFormatter.format(Number(trip.revenue ?? 0)),
    ];
    doc.text(line.join(" | "), 14, 38 + index * 8);
  });
  doc.save("fleetflow-trip-invoices.pdf");
};

const generateMonthlyReportPDF = (
  months: { key: string; label: string }[],
  monthlyRevenue: number[],
  monthlyExpenses: number[],
) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Monthly Finance Report", 14, 20);
  doc.setFontSize(12);
  doc.text("Month | Revenue | Expenses | Profit", 14, 32);
  months.forEach((month, index) => {
    const revenue = monthlyRevenue[index] ?? 0;
    const expenses = monthlyExpenses[index] ?? 0;
    const profit = revenue - expenses;
    const line = `${month.label} | ${currencyFormatter.format(revenue)} | ${currencyFormatter.format(expenses)} | ${currencyFormatter.format(profit)}`;
    doc.text(line, 14, 40 + index * 8);
  });
  doc.save("fleetflow-monthly-report.pdf");
};

const buildExpenseBreakdown = (expenses: Expense[]) => {
  const buckets: Record<string, number> = {};
  expenses.forEach((expense) => {
    const category = expense.category || "Uncategorized";
    buckets[category] = (buckets[category] ?? 0) + Number(expense.amount ?? 0);
  });
  return Object.entries(buckets).map(([category, amount]) => ({ category, amount }));
};

export function FinancePanel({ trips, vehicles, drivers, expenses, rollingMonths, monthlyRevenue, monthlyExpenses }: FinancePanelProps) {
  const monthlyProfit = useMemo(() => monthlyRevenue.map((value, index) => value - (monthlyExpenses[index] ?? 0)), [monthlyRevenue, monthlyExpenses]);
  const totalProfit = monthlyProfit.reduce((sum, value) => sum + value, 0);
  const breakdown = useMemo(() => buildExpenseBreakdown(expenses), [expenses]);

  const revenueSummary = useMemo(() => trips.reduce((total, trip) => total + Number(trip.revenue ?? 0), 0), [trips]);
  const expenseSummary = useMemo(() => expenses.reduce((total, expense) => total + Number(expense.amount ?? 0), 0), [expenses]);

  const handleExport = (type: string) => {
    switch (type) {
      case "trips":
        exportToExcel(
          trips.map((trip) => ({
            origin: trip.origin,
            destination: trip.destination,
            revenue: trip.revenue,
            status: trip.status,
            driver_id: trip.driver_id,
            vehicle_id: trip.vehicle_id,
          })),
          "fleetflow-trips",
        );
        break;
      case "vehicles":
        exportToExcel(
          vehicles.map((vehicle) => ({
            name: vehicle.name,
            vehicle_number: vehicle.vehicle_number,
            vehicle_type: vehicle.vehicle_type,
            capacity: vehicle.capacity,
            status: vehicle.status,
            insurance_expiry: vehicle.insurance_expiry,
            registration_expiry: vehicle.registration_expiry,
          })),
          "fleetflow-vehicles",
        );
        break;
      case "drivers":
        exportToExcel(
          drivers.map((driver) => ({
            name: driver.full_name,
            phone: driver.phone,
            license_number: driver.license_number,
            status: driver.status,
            assigned_vehicle_id: driver.assigned_vehicle_id,
          })),
          "fleetflow-drivers",
        );
        break;
      case "expenses":
        exportToExcel(
          expenses.map((expense) => ({
            trip_id: expense.trip_id,
            category: expense.category,
            amount: expense.amount,
            description: expense.description,
          })),
          "fleetflow-expenses",
        );
        break;
      default:
        break;
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Finance</p>
        <h3 className="text-2xl font-semibold text-slate-900">Revenue, expenses, and exports</h3>
        <p className="text-sm text-slate-500">Track profit, break down costs, and export operational reports.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Revenue summary</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{currencyFormatter.format(revenueSummary)}</p>
          <p className="text-xs text-slate-500">All trips</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Expense summary</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{currencyFormatter.format(expenseSummary)}</p>
          <p className="text-xs text-slate-500">Categorized ledger</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Monthly profit</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{currencyFormatter.format(totalProfit)}</p>
          <p className="text-xs text-slate-500">Trailing 6 months</p>
        </div>
      </div>
      <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Expense breakdown</p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          {breakdown.length ? (
            breakdown.map((item) => (
              <span key={item.category} className="rounded-2xl border border-slate-200 px-3 py-1">
                {item.category}: {currencyFormatter.format(item.amount)}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-400">No expenses recorded yet.</p>
          )}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => generateTripInvoicePDF(trips)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          Trip Invoice PDF
        </button>
        <button
          type="button"
          onClick={() => generateMonthlyReportPDF(rollingMonths, monthlyRevenue, monthlyExpenses)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          Monthly Report PDF
        </button>
        <button
          type="button"
          onClick={() => handleExport("trips")}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          Export Trips Excel
        </button>
        <button
          type="button"
          onClick={() => handleExport("vehicles")}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          Export Vehicles Excel
        </button>
        <button
          type="button"
          onClick={() => handleExport("drivers")}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          Export Drivers Excel
        </button>
        <button
          type="button"
          onClick={() => handleExport("expenses")}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          Export Expenses Excel
        </button>
      </div>
    </section>
  );
}
