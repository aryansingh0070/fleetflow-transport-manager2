import { useMemo, useState } from "react";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { createDriver, deleteDriver, updateDriver, type DriverPayload } from "../../services/operationsService";
import type { Driver, Vehicle } from "../../types";

const statusOptions = ["active", "inactive", "on_duty", "off_duty"] as const;

type DriverManagerProps = {
  drivers: Driver[];
  vehicles: Vehicle[];
  onRefresh: () => Promise<void>;
};

type DriverForm = DriverPayload & {
  id?: string | null;
};

const initialDriverForm: DriverForm = {
  full_name: "",
  phone: null,
  license_number: null,
  license_expiry: null,
  assigned_vehicle_id: null,
  status: "active",
};

const isLicenseExpiringSoon = (value?: string | null) => {
  if (!value) {
    return false;
  }
  const threshold = new Date(value);
  if (Number.isNaN(threshold.getTime())) {
    return false;
  }
  const diff = threshold.getTime() - new Date().getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 30;
};

export function DriverManager({ drivers, vehicles, onRefresh }: DriverManagerProps) {
  const [form, setForm] = useState<DriverForm>(initialDriverForm);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toast = useToast();

  const filteredDrivers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return drivers.filter((driver) => {
      const matchesQuery =
        !query ||
        driver.full_name.toLowerCase().includes(query) ||
        (driver.license_number ?? "").toLowerCase().includes(query);
      const matchesStatus = !statusFilter || driver.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  const expiringLicenses = useMemo(
    () => drivers.filter((driver) => isLicenseExpiringSoon(driver.license_expiry)),
    [drivers],
  );

  const handleSelectDriver = (driver: Driver) => {
    setErrorMessage(null);
    setForm({
      id: driver.id,
      full_name: driver.full_name,
      phone: driver.phone,
      license_number: driver.license_number,
      license_expiry: driver.license_expiry,
      assigned_vehicle_id: driver.assigned_vehicle_id,
      status: driver.status,
    });
  };

  const handleFieldUpdate = (key: keyof DriverForm, value: DriverForm[typeof key]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const clearForm = () => {
    setForm(initialDriverForm);
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const validate = () => {
    if (!form.full_name.trim()) {
      throw new Error("Driver name is required.");
    }
  };

  const persistDriver = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      validate();
      const payload: DriverPayload = {
        full_name: form.full_name.trim(),
        phone: form.phone?.trim() || null,
        license_number: form.license_number?.trim() || null,
        license_expiry: form.license_expiry,
        assigned_vehicle_id: form.assigned_vehicle_id,
        status: form.status,
      };

      if (form.id) {
        await updateDriver(form.id, payload);
        setStatusMessage("Driver updated.");
        toast.addToast({ level: "success", message: "Driver updated." });
      } else {
        await createDriver(payload);
        setStatusMessage("Driver added.");
        toast.addToast({ level: "success", message: "Driver added." });
      }

      await onRefresh();
      clearForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save driver.";
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
      await deleteDriver(form.id);
      setStatusMessage("Driver removed.");
      toast.addToast({ level: "success", message: "Driver removed." });
      clearForm();
      await onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete driver.";
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
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Driver management</p>
          <h3 className="text-xl font-semibold text-slate-900">Maintain profiles and assignments</h3>
        </div>
        <div className="flex gap-2 text-xs text-slate-500">
          {expiringLicenses.length ? (
            <p className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-semibold text-rose-600">
              {expiringLicenses.length} license expiring
            </p>
          ) : (
            <p className="rounded-full border border-slate-200 px-3 py-1">No expiring licenses</p>
          )}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 text-sm text-slate-500">
          <label className="block text-sm font-semibold text-slate-600">
            Search
            <input
              type="text"
              placeholder="Name or license"
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
              <option value="">All</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          {expiringLicenses.length > 0 && (
            <div className="space-y-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-500">License expiring</p>
              {expiringLicenses.map((driver) => (
                <div key={driver.id}>
                  <p className="font-semibold">{driver.full_name}</p>
                  <p className="text-xs text-rose-500">Expires {new Date(driver.license_expiry ?? "").toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          {filteredDrivers.slice(0, 6).map((driver) => (
            <button
              key={driver.id}
              type="button"
              onClick={() => handleSelectDriver(driver)}
              className="w-full rounded-2xl border border-transparent px-4 py-3 text-left hover:border-indigo-200"
            >
              <p className="font-semibold text-slate-900">{driver.full_name}</p>
              <p className="text-xs text-slate-500">{driver.license_number ?? "No license"}</p>
            </button>
          ))}
          {!filteredDrivers.length && <p className="text-center text-xs text-slate-400">No drivers match your filters.</p>}
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-600">
            Name
            <input
              type="text"
              value={form.full_name}
              onChange={(event) => handleFieldUpdate("full_name", event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Phone
            <input
              type="tel"
              value={form.phone ?? ""}
              onChange={(event) => handleFieldUpdate("phone", event.target.value || null)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-600">
            License number
            <input
              type="text"
              value={form.license_number ?? ""}
              onChange={(event) => handleFieldUpdate("license_number", event.target.value || null)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            License expiry
            <input
              type="date"
              value={form.license_expiry ?? ""}
              onChange={(event) => handleFieldUpdate("license_expiry", event.target.value || null)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-600">
            Assigned vehicle
            <select
              value={form.assigned_vehicle_id ?? ""}
              onChange={(event) => handleFieldUpdate("assigned_vehicle_id", event.target.value || null)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            >
              <option value="">Unassigned</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Status
            <select
              value={form.status}
              onChange={(event) => handleFieldUpdate("status", event.target.value)}
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
          <p id="driver-error" role="alert" className="text-sm text-rose-500">
            {errorMessage}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={persistDriver}
            disabled={loading}
            className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {form.id ? "Update driver" : "Add driver"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
              className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 disabled:cursor-not-allowed"
            >
              Delete driver
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
        title="Delete driver"
        description="This driver will be removed from the roster. Confirm to proceed."
        onConfirm={performDelete}
        onClose={() => setConfirmOpen(false)}
        confirmLabel="Delete"
      />
    </section>
  );
}
