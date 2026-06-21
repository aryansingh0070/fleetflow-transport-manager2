export type FleetRole = "owner" | "accountant" | "dispatcher" | "driver";

export interface FleetUser {
  id: string;
  email: string;
  full_name: string;
  organization: string | null;
  role: FleetRole;
  created_at: string | null;
}

export type VehicleStatus = "available" | "assigned" | "in_service" | "maintenance" | "offline";

export interface Vehicle {
  id: string;
  name: string;
  vehicle_number: string | null;
  vehicle_type: string;
  capacity: number | null;
  license_plate: string | null;
  status: VehicleStatus;
  insurance_expiry: string | null;
  registration_expiry: string | null;
  mileage: number | null;
  last_service: string | null;
  updated_at: string | null;
}

export interface Driver {
  id: string;
  full_name: string;
  license_number: string | null;
  phone: string | null;
  license_expiry: string | null;
  assigned_vehicle_id: string | null;
  status: string;
  user_id: string | null;
  created_at: string | null;
}

export type TripStatus = "pending" | "assigned" | "in_transit" | "completed" | "cancelled";

export interface Trip {
  id: string;
  vehicle_id: string;
  driver_id: string;
  origin: string;
  destination: string;
  revenue: number | null;
  status: TripStatus;
  started_at: string | null;
  ended_at: string | null;
  created_at: string | null;
}

export interface Expense {
  id: string;
  trip_id: string;
  category: string;
  amount: number;
  description: string | null;
  occurred_at: string | null;
  created_at: string | null;
}

export type SummaryCard = {
  label: string;
  value: string | number;
  detail: string;
};

export type RolePlaybookConfig = {
  title: string;
  description: string;
  actions: string[];
};
