import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TripManager } from "../../components/operations/TripManager";
import { VehicleManager } from "../../components/operations/VehicleManager";
import { DriverManager } from "../../components/operations/DriverManager";
import { ToastProvider } from "../../context/ToastContext";
import * as operationsService from "../../services/operationsService";
import type { Driver, Vehicle, Trip } from "../../types";

const mockCreateTrip = vi.spyOn(operationsService, "createTrip").mockResolvedValue({ id: "trip-1" } as Trip);
const mockUpdateTrip = vi.spyOn(operationsService, "updateTrip").mockResolvedValue({ id: "trip-1" } as Trip);
const mockDeleteTrip = vi.spyOn(operationsService, "deleteTrip").mockResolvedValue(undefined);
const mockCreateVehicle = vi.spyOn(operationsService, "createVehicle").mockResolvedValue({ id: "veh-1" } as Vehicle);
const mockUpdateVehicle = vi.spyOn(operationsService, "updateVehicle").mockResolvedValue({ id: "veh-1" } as Vehicle);
const mockDeleteVehicle = vi.spyOn(operationsService, "deleteVehicle").mockResolvedValue(undefined);
const mockCreateDriver = vi.spyOn(operationsService, "createDriver").mockResolvedValue({ id: "drv-1" } as Driver);
const mockUpdateDriver = vi.spyOn(operationsService, "updateDriver").mockResolvedValue({ id: "drv-1" } as Driver);
const mockDeleteDriver = vi.spyOn(operationsService, "deleteDriver").mockResolvedValue(undefined);

const vehicles: Vehicle[] = [
  {
    id: "veh-1",
    name: "Truck 1",
    vehicle_number: "TRK-001",
    vehicle_type: "truck",
    capacity: 15,
    license_plate: "ABC123",
    status: "available",
    insurance_expiry: null,
    registration_expiry: null,
    mileage: 0,
    last_service: null,
    updated_at: null,
  },
];

const drivers: Driver[] = [
  {
    id: "drv-1",
    full_name: "Jane Driver",
    license_number: "LIC123",
    phone: "555-1234",
    license_expiry: null,
    assigned_vehicle_id: "veh-1",
    status: "active",
    user_id: "user-1",
    created_at: null,
  },
];

const trips: Trip[] = [
  {
    id: "trip-1",
    origin: "A",
    destination: "B",
    revenue: 150,
    status: "pending",
    vehicle_id: "veh-1",
    driver_id: "drv-1",
    started_at: null,
    ended_at: null,
    created_at: "2023-01-01T00:00:00Z",
  },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe("TripManager integration", () => {
  const renderTripManager = () =>
    render(
      <ToastProvider>
        <TripManager trips={trips} vehicles={vehicles} drivers={drivers} onRefresh={vi.fn()} />
      </ToastProvider>,
    );

  it("creates a trip", async () => {
    renderTripManager();
    fireEvent.change(screen.getByLabelText(/origin/i), { target: { value: "Austin" } });
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: "Dallas" } });
    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: "120" } });
    fireEvent.click(screen.getByRole("button", { name: /create trip/i }));

    await waitFor(() => {
      expect(mockCreateTrip).toHaveBeenCalled();
    });
  });

  it("updates and deletes a trip", async () => {
    renderTripManager();
    fireEvent.click(screen.getByRole("button", { name: "A → B" }));
    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: "200" } });
    fireEvent.click(screen.getByRole("button", { name: /update trip/i }));
    await waitFor(() => expect(mockUpdateTrip).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /delete trip/i }));
    fireEvent.click(await screen.findByRole("button", { name: /delete/i }));
    await waitFor(() => expect(mockDeleteTrip).toHaveBeenCalled());
  });

  it("validates required fields and revenue/dates", async () => {
    renderTripManager();
    fireEvent.change(screen.getByLabelText(/origin/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /create trip/i }));
    expect(await screen.findByText(/origin and destination are required/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/origin/i), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: "B" } });
    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: "-5" } });
    fireEvent.click(screen.getByRole("button", { name: /create trip/i }));
    expect(await screen.findByText(/revenue must be zero or greater/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: "2024-01-01T10:00" } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: "2024-01-01T09:00" } });
    fireEvent.click(screen.getByRole("button", { name: /create trip/i }));
    expect(await screen.findByText(/end time must be after the start time/i)).toBeInTheDocument();
  });
});

describe("VehicleManager integration", () => {
  const renderVehicleManager = () =>
    render(
      <ToastProvider>
        <VehicleManager vehicles={vehicles} onRefresh={vi.fn()} />
      </ToastProvider>,
    );

  it("creates, updates, and deletes a vehicle", async () => {
    renderVehicleManager();
    fireEvent.change(screen.getByLabelText(/vehicle name/i), { target: { value: "New Truck" } });
    fireEvent.change(screen.getByLabelText(/capacity/i), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));
    await waitFor(() => expect(mockCreateVehicle).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Truck 1" }));
    fireEvent.change(screen.getByLabelText(/capacity/i), { target: { value: "20" } });
    fireEvent.click(screen.getByRole("button", { name: /update vehicle/i }));
    await waitFor(() => expect(mockUpdateVehicle).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /delete vehicle/i }));
    fireEvent.click(await screen.findByRole("button", { name: /delete/i }));
    await waitFor(() => expect(mockDeleteVehicle).toHaveBeenCalled());
  });

  it("validates capacity", async () => {
    renderVehicleManager();
    fireEvent.change(screen.getByLabelText(/vehicle name/i), { target: { value: "Bad" } });
    fireEvent.change(screen.getByLabelText(/vehicle type/i), { target: { value: "Van" } });
    fireEvent.change(screen.getByLabelText(/capacity/i), { target: { value: "-3" } });
    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));
    expect(await screen.findByText(/capacity cannot be negative/i)).toBeInTheDocument();
  });
});

describe("DriverManager integration", () => {
  const renderDriverManager = () =>
    render(
      <ToastProvider>
        <DriverManager drivers={drivers} vehicles={vehicles} onRefresh={vi.fn()} />
      </ToastProvider>,
    );

  it("creates, updates, and deletes a driver", async () => {
    renderDriverManager();
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "New Driver" } });
    fireEvent.click(screen.getByRole("button", { name: /add driver/i }));
    await waitFor(() => expect(mockCreateDriver).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Jane Driver" }));
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Updated Driver" } });
    fireEvent.click(screen.getByRole("button", { name: /update driver/i }));
    await waitFor(() => expect(mockUpdateDriver).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /delete driver/i }));
    fireEvent.click(await screen.findByRole("button", { name: /delete/i }));
    await waitFor(() => expect(mockDeleteDriver).toHaveBeenCalled());
  });

  it("validates license and phone", async () => {
    renderDriverManager();
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "License Free" } });
    fireEvent.click(screen.getByRole("button", { name: /add driver/i }));
    expect(await screen.findByText(/driver name is required/i)).toBeInTheDocument();
  });
});
