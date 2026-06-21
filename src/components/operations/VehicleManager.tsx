import { useMemo, useState } from "react";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { createVehicle, deleteVehicle, updateVehicle, type VehiclePayload } from "../../services/operationsService";
import type { Vehicle, VehicleStatus } from "../../types";

const statusOptions: VehicleStatus[] = ["available", "assigned", "in_service", "maintenance", "offline"];

type VehicleManagerProps = {
  vehicles: Vehicle[];
  onRefresh: () => Promise<void>;
};

type VehicleFormState = VehiclePayload & {
  id?: string | null;
};

const initialVehicleForm: VehicleFormState = {
  name: "",
  vehicle_type: "truck",
  vehicle_number: null,
  capacity: null,
  license_plate: null,
  status: "available",
  insurance_expiry: null,
  registration_expiry: null,
};

const isExpiringSoon = (value?: string | null) => {
  if (!value) {
    return false;
  }
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return false;
  }
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 30;
};

export function VehicleManager({ vehicles, onRefresh }: VehicleManagerProps) {
  const [form, setForm] = useState<VehicleFormState>(initialVehicleForm);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toast = useToast();

  const filteredVehicles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesQuery =
        !query ||
        vehicle.name.toLowerCase().includes(query) ||
        (vehicle.vehicle_number ?? "").toLowerCase().includes(query) ||
        vehicle.vehicle_type.toLowerCase().includes(query);
      const matchesStatus = !statusFilter || vehicle.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  const alerts = useMemo(
    () =>
      vehicles
        .map((vehicle) => {
          const reasons: string[] = [];
          if (isExpiringSoon(vehicle.insurance_expiry)) {
            reasons.push("Insurance");
          }
          if (isExpiringSoon(vehicle.registration_expiry)) {
            reasons.push("Registration");
          }
          if (!reasons.length) {
            return null;
          }
          return { vehicle, reasons };
        })
        .filter(Boolean) as { vehicle: Vehicle; reasons: string[] }[],
    [vehicles],
  );

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setErrorMessage(null);
    setForm({
      id: vehicle.id,
      name: vehicle.name,
      vehicle_type: vehicle.vehicle_type,
      vehicle_number: vehicle.vehicle_number,
      capacity: vehicle.capacity,
      license_plate: vehicle.license_plate,
      status: vehicle.status,
      insurance_expiry: vehicle.insurance_expiry,
      registration_expiry: vehicle.registration_expiry,
    });
  };

  const handleFieldUpdate = (key: keyof VehicleFormState, value: VehicleFormState[typeof key]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const clearForm = () => {
    setForm(initialVehicleForm);
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const validate = () => {
    if (!form.name.trim()) {
      throw new Error("Vehicle name is required.");
    }
    if (!form.vehicle_type.trim()) {
      throw new Error("Vehicle type is required.");
    }
    if (form.capacity !== null && form.capacity < 0) {
      throw new Error("Capacity cannot be negative.");
    }
  };

  const persistVehicle = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      validate();
      const payload: VehiclePayload = {
        name: form.name.trim(),
        vehicle_type: form.vehicle_type.trim(),
        vehicle_number: form.vehicle_number?.trim() || null,
        capacity: form.capacity,
        license_plate: form.license_plate?.trim() || null,
        status: form.status,
        insurance_expiry: form.insurance_expiry,
        registration_expiry: form.registration_expiry,
      };

      if (form.id) {
        await updateVehicle(form.id, payload);
        setStatusMessage("Vehicle updated.");
        toast.addToast({ level: "success", message: "Vehicle updated." });
      } else {
        await createVehicle(payload);
        setStatusMessage("Vehicle created.");
        toast.addToast({ level: "success", message: "Vehicle added." });
      }

      clearForm();
      await onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save vehicle.";
      setErrorMessage(message);
      toast.addToast({ level: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const performDelete = async () => {
    if (!form.id) {
      setConfirmOpen(false);
      return;
    }

    setConfirmOpen(false);
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await deleteVehicle(form.id);
      setStatusMessage("Vehicle removed.");
      toast.addToast({ level: "success", message: "Vehicle removed." });
      clearForm();
      await onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete vehicle.";
      setErrorMessage(message);
      toast.addToast({ level: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Vehicle management</p>
          <h3 className="text-xl font-semibold text-slate-900">Track, filter, and alert on vehicles</h3>
        </div>
        <div className="flex gap-2 text-xs text-slate-500">
          {alerts.length ? (
            <p className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-semibold text-rose-600">
              {alerts.length} expiring soon
            </p>
          ) : (
            <p className="rounded-full border border-slate-200 px-3 py-1">No alerts</p>
          )}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 text-sm text-slate-500">
          <label className="block text-sm font-semibold text-slate-600">
            Search
            <input
              type="text"
              placeholder="Vehicle number, name, or type"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Filter by status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          {alerts.length > 0 && (
            <div className="space-y-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Alerts</p>
              {alerts.map(({ vehicle, reasons }) => (
                <div key={vehicle.id}>
                  <p className="font-semibold">{vehicle.name}</p>
                  <p className="text-xs text-rose-500">{reasons.join(" & ")} expiring soon</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          {filteredVehicles.slice(0, 6).map((vehicle) => (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => handleSelectVehicle(vehicle)}
              className="w-full rounded-2xl border border-transparent px-4 py-3 text-left hover:border-indigo-200"
            >
              <p className="font-semibold text-slate-900">{vehicle.name}</p>
              <p className="text-xs text-slate-500">{vehicle.vehicle_number ?? vehicle.license_plate ?? "No id"}</p>
            </button>
          ))}
          {!filteredVehicles.length && <p className="text-center text-xs text-slate-400">No vehicles match your filters.</p>}
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-600">
            Vehicle name
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleFieldUpdate("name", event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
              aria-invalid={Boolean(errorMessage)}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Vehicle number
            <input
              type="text"
              value={form.vehicle_number ?? ""}
              onChange={(event) => handleFieldUpdate("vehicle_number", event.target.value || null)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-600">
            Vehicle type
            <input
              type="text"
              value={form.vehicle_type}
              onChange={(event) => handleFieldUpdate("vehicle_type", event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Capacity
            <input
              type="number"
              min={0}
              value={form.capacity ?? ""}
              onChange={(event) => handleFieldUpdate("capacity", event.target.value ? Number(event.target.value) : null)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-600">
            Insurance expiry
            <input
              type="date"
              value={form.insurance_expiry ?? ""}
              onChange={(event) => handleFieldUpdate("insurance_expiry", event.target.value || null)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Registration expiry
            <input
              type="date"
              value={form.registration_expiry ?? ""}
              onChange={(event) => handleFieldUpdate("registration_expiry", event.target.value || null)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-600">
            License plate
            <input
              type="text"
              value={form.license_plate ?? ""}
              onChange={(event) => handleFieldUpdate("license_plate", event.target.value || null)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Status
            <select
              value={form.status}
              onChange={(event) => handleFieldUpdate("status", event.target.value as VehicleStatus)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        {statusMessage && (
          <p role="status" aria-live="polite" className="text-sm text-emerald-600">
            {statusMessage}
          </p>
        )}
        {errorMessage && (
          <p id="vehicle-error" role="alert" className="text-sm text-rose-500">
            {errorMessage}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={persistVehicle}
            disabled={loading}
            className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {form.id ? "Update vehicle" : "Add vehicle"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
              className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 disabled:cursor-not-allowed"
            >
              Delete vehicle
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
      <ConfirmDialog
        open={confirmOpen}
        title="Delete vehicle"
        description="Removing this vehicle cannot be undone. Confirm to delete."
        onConfirm={performDelete}
        onClose={() => setConfirmOpen(false)}
        confirmLabel="Delete"
      />
    </section>
  );
}
