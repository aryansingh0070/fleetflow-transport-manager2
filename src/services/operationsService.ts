import { supabase } from "../lib/supabaseClient";
import type { Driver, Trip, TripStatus, Vehicle } from "../types";

export type TripPayload = {
  origin: string;
  destination: string;
  revenue: number;
  status: TripStatus;
  driver_id: string | null;
  vehicle_id: string | null;
  started_at: string | null;
  ended_at: string | null;
};

export type VehiclePayload = {
  name: string;
  vehicle_number?: string | null;
  vehicle_type: string;
  capacity: number | null;
  license_plate?: string | null;
  status: Vehicle["status"];
  insurance_expiry?: string | null;
  registration_expiry?: string | null;
};

export type DriverPayload = {
  full_name: string;
  phone?: string | null;
  license_number?: string | null;
  license_expiry?: string | null;
  assigned_vehicle_id?: string | null;
  status: Driver["status"];
};

const throwOnError = (error: { message: string } | null) => {
  if (error) {
    throw new Error(error.message);
  }
};

export const createTrip = async (payload: TripPayload): Promise<Trip> => {
  const { data, error } = await supabase.from("trips").insert(payload).select().single();
  throwOnError(error);
  return data as Trip;
};

export const updateTrip = async (id: string, payload: TripPayload): Promise<Trip> => {
  const { data, error } = await supabase.from("trips").update(payload).eq("id", id).select().maybeSingle();
  throwOnError(error);
  if (!data) {
    throw new Error("Trip not found");
  }
  return data;
};

export const deleteTrip = async (id: string) => {
  const { error } = await supabase.from("trips").delete().eq("id", id);
  throwOnError(error);
};

export const createVehicle = async (payload: VehiclePayload): Promise<Vehicle> => {
  const { data, error } = await supabase
    .from("vehicles")
    .insert({ ...payload, status: payload.status || "available" })
    .select()
    .single();
  throwOnError(error);
  return data as Vehicle;
};

export const updateVehicle = async (id: string, payload: VehiclePayload): Promise<Vehicle> => {
  const { data, error } = await supabase.from("vehicles").update(payload).eq("id", id).select().maybeSingle();
  throwOnError(error);
  if (!data) {
    throw new Error("Vehicle not found");
  }
  return data;
};

export const deleteVehicle = async (id: string) => {
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  throwOnError(error);
};

export const createDriver = async (payload: DriverPayload): Promise<Driver> => {
  const { data, error } = await supabase.from("drivers").insert(payload).select().single();
  throwOnError(error);
  return data as Driver;
};

export const updateDriver = async (id: string, payload: DriverPayload): Promise<Driver> => {
  const { data, error } = await supabase.from("drivers").update(payload).eq("id", id).select().maybeSingle();
  throwOnError(error);
  if (!data) {
    throw new Error("Driver not found");
  }
  return data;
};

export const deleteDriver = async (id: string) => {
  const { error } = await supabase.from("drivers").delete().eq("id", id);
  throwOnError(error);
};
