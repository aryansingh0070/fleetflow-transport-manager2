-- Supabase schema for FleetFlow Transport Manager
-- Deploy these statements in a migration or Supabase SQL editor.

create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text not null,
  organization text,
  role text not null default 'dispatcher' check (role in ('owner', 'accountant', 'dispatcher', 'driver')),
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  vehicle_number text unique,
  vehicle_type text not null default 'truck',
  capacity int4 default 0,
  license_plate text unique,
  status text not null default 'available',
  insurance_expiry date,
  registration_expiry date,
  mileage int4 default 0,
  last_service date,
  updated_at timestamptz not null default now()
);

create table if not exists drivers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  full_name text not null,
  license_number text,
  phone text,
  license_expiry timestamptz,
  assigned_vehicle_id uuid references vehicles(id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists trips (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid references vehicles(id) on delete set null,
  driver_id uuid references drivers(id) on delete set null,
  origin text not null,
  destination text not null,
  revenue numeric(12, 2) default 0,
  status text not null default 'pending' check (status in ('pending', 'assigned', 'in_transit', 'completed', 'cancelled')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade,
  category text not null,
  amount numeric(12, 2) not null default 0,
  description text,
  occurred_at timestamptz not null default now()
);
