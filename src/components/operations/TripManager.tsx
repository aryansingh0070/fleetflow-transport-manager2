import { useMemo, useState } from "react";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { createTrip, deleteTrip, updateTrip, type TripPayload } from "../../services/operationsService";
import type { Driver, Trip, Vehicle, TripStatus } from "../../types";

const tripStatuses: TripStatus[] = ["pending", "assigned", "in_transit", "completed", "cancelled"];

type TripManagerProps = {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onRefresh: () => Promise<void>;
};

type TripFormState = TripPayload & {
  id?: string | null;
};

const initialForm: TripFormState = {
  origin: "",
  destination: "",
  revenue: 0,
  status: "pending",
  driver_id: null,
  vehicle_id: null,
  started_at: null,
  ended_at: null,
};

export function TripManager({ trips, vehicles, drivers, onRefresh }: TripManagerProps) {
  const [form, setForm] = useState<TripFormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toast = useToast();

  const recentTrips = useMemo(() => [...trips].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")), [trips]);

  const handleSelectTrip = (trip: Trip) => {
    setErrorMessage(null);
    setForm({
      id: trip.id,
      origin: trip.origin,
      destination: trip.destination,
      revenue: Number(trip.revenue ?? 0),
      status: trip.status ?? "pending",
      driver_id: trip.driver_id ?? null,
      vehicle_id: trip.vehicle_id ?? null,
      started_at: trip.started_at ?? null,
      ended_at: trip.ended_at ?? null,
    });
  };

  const handleFieldUpdate = (key: keyof TripFormState, value: TripFormState[typeof key]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const clearForm = () => {
    setForm(initialForm);
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const validate = () => {
    if (!form.origin.trim() || !form.destination.trim()) {
      throw new Error("Origin and destination are required.");
    }

    if (form.revenue < 0) {
      throw new Error("Revenue must be zero or greater.");
    }

    if (form.started_at && form.ended_at) {
      const start = new Date(form.started_at);
      const end = new Date(form.ended_at);
      if (end < start) {
        throw new Error("End time must be after the start time.");
      }
    }
  };

  const persistTrip = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      validate();
      const payload: TripPayload = {
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        revenue: Number(form.revenue ?? 0),
        status: form.status,
        driver_id: form.driver_id,
        vehicle_id: form.vehicle_id,
        started_at: form.started_at,
        ended_at: form.ended_at,
      };

      if (form.id) {
        await updateTrip(form.id, payload);
        setStatusMessage("Trip updated.");
        toast.addToast({ level: "success", message: "Trip updated." });
      } else {
        await createTrip(payload);
        setStatusMessage("Trip created.");
        toast.addToast({ level: "success", message: "Trip created." });
      }

      await onRefresh();
      clearForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save trip.";
      setErrorMessage(message);
      toast.addToast({ level: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const performDelete = async () => {
    if (!form.id) {
      return;
    }

    setConfirmOpen(false);
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await deleteTrip(form.id);
      setStatusMessage("Trip deleted.");
      toast.addToast({ level: "success", message: "Trip deleted." });
      clearForm();
      await onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete trip.";
      setErrorMessage(message);
      toast.addToast({ level: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Trip management</p>
          <h3 className="text-xl font-semibold text-slate-900">Create, assign, and track trips</h3>
          <p className="text-sm text-slate-500">Use the form to create a new trip or edit existing trips from the roster.</p>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-600">
            Origin
            <input
              type="text"
              value={form.origin}
              onChange={(event) => handleFieldUpdate("origin", event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              aria-invalid={Boolean(errorMessage)}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Destination
            <input
              type="text"
              value={form.destination}
              onChange={(event) => handleFieldUpdate("destination", event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              aria-invalid={Boolean(errorMessage)}
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-600">
              Revenue ($)
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.revenue}
                onChange={(event) => handleFieldUpdate("revenue", Number(event.target.value))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
                aria-invalid={form.revenue < 0}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Status
              <select
                value={form.status}
                onChange={(event) => handleFieldUpdate("status", event.target.value as TripStatus)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              >
                {tripStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-600">
              Driver
              <select
                value={form.driver_id ?? ""}
                onChange={(event) => handleFieldUpdate("driver_id", event.target.value || null)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Vehicle
              <select
                value={form.vehicle_id ?? ""}
                onChange={(event) => handleFieldUpdate("vehicle_id", event.target.value || null)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-600">
              Start date
              <input
                type="datetime-local"
                value={form.started_at ?? ""}
                onChange={(event) => handleFieldUpdate("started_at", event.target.value || null)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              End date
              <input
                type="datetime-local"
                value={form.ended_at ?? ""}
                onChange={(event) => handleFieldUpdate("ended_at", event.target.value || null)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              />
            </label>
          </div>
        </div>
        {statusMessage && (
          <p role="status" aria-live="polite" className="text-sm text-emerald-600">
            {statusMessage}
          </p>
        )}
        {errorMessage && (
          <p id="trip-error" role="alert" className="text-sm text-rose-500">
            {errorMessage}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={persistTrip}
            disabled={loading}
            className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {form.id ? "Update trip" : "Create trip"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
              className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 disabled:cursor-not-allowed"
            >
              Delete trip
            </button>
          )}
          <button
            type="button"
            onClick={clearForm}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Trip roster</p>
          <p className="text-xs text-slate-500">Select to edit</p>
        </div>
        <div className="space-y-2 text-sm text-slate-700">
          {recentTrips.slice(0, 6).map((trip) => (
            <button
              key={trip.id}
              type="button"
              onClick={() => handleSelectTrip(trip)}
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left hover:border-indigo-200"
            >
              <p className="font-semibold text-slate-900">{trip.origin} → {trip.destination}</p>
              <p className="text-xs text-slate-500">
                {trip.status.replace("_", " ")} • {trip.driver_id ? "Driver assigned" : "Driver unassigned"}
              </p>
            </button>
          ))}
          {!recentTrips.length && <p className="text-center text-sm text-slate-400">No trips synced yet.</p>}
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm trip deletion"
        description="Deleting a trip cannot be undone. Are you sure you want to remove this trip?"
        onConfirm={performDelete}
        onClose={() => setConfirmOpen(false)}
        confirmLabel="Delete"
        cancelLabel="Keep"
      />
    </section>
  );
}
