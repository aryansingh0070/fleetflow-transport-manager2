import { supabase } from "../lib/supabaseClient";
import type { PostgrestResponse } from "@supabase/postgrest-js";
import type { Driver, Expense, Trip, Vehicle } from "../types";

export interface FleetSnapshot {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  expenses: Expense[];
}

const defaultLimit = 50;

export const fetchFleetSnapshot = async (): Promise<FleetSnapshot> => {
  const vehiclesQuery = supabase
    .from("vehicles")
    .select(
      "id,name,vehicle_number,vehicle_type,capacity,license_plate,status,insurance_expiry,registration_expiry,mileage,last_service,updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(defaultLimit);
  const tripsQuery = supabase
    .from("trips")
    .select("id,vehicle_id,driver_id,origin,destination,revenue,status,started_at,ended_at,created_at")
    .order("started_at", { ascending: false })
    .limit(defaultLimit);
  const driversQuery = supabase
    .from("drivers")
    .select("id,full_name,license_number,phone,license_expiry,assigned_vehicle_id,status,user_id,created_at")
    .order("full_name", { ascending: true })
    .limit(defaultLimit);
  const expensesQuery = supabase
    .from("expenses")
    .select("id,trip_id,category,amount,description,occurred_at,created_at")
    .order("occurred_at", { ascending: false })
    .limit(defaultLimit);

  const [vehiclesRes, tripsRes, driversRes, expensesRes] = (await Promise.all([
    vehiclesQuery,
    tripsQuery,
    driversQuery,
    expensesQuery,
  ])) as [
    PostgrestResponse<Vehicle>,
    PostgrestResponse<Trip>,
    PostgrestResponse<Driver>,
    PostgrestResponse<Expense>,
  ];

  const errors = [
    { label: "vehicles", error: vehiclesRes.error },
    { label: "trips", error: tripsRes.error },
    { label: "drivers", error: driversRes.error },
    { label: "expenses", error: expensesRes.error },
  ];

  const error = errors.find((candidate) => candidate.error)?.error;
  if (error) {
    throw new Error(error.message);
  }

  return {
    vehicles: vehiclesRes.data ?? [],
    trips: tripsRes.data ?? [],
    drivers: driversRes.data ?? [],
    expenses: expensesRes.data ?? [],
  };
};
