-- Supabase Row Level Security policies

-- Enable RLS on application tables
alter table if exists users enable row level security;
alter table if exists vehicles enable row level security;
alter table if exists drivers enable row level security;
alter table if exists trips enable row level security;
alter table if exists expenses enable row level security;

-- Role helpers
create or replace function public.is_owner() returns boolean as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'owner');
$$ language sql stable;

create or replace function public.has_role(target_role text) returns boolean as $$
  select exists (select 1 from public.users where id = auth.uid() and role = target_role);
$$ language sql stable;

create or replace function public.has_any_role(roles text[]) returns boolean as $$
  select exists (select 1 from public.users where id = auth.uid() and role = any(roles));
$$ language sql stable;

-- Users access
create policy "Owners manage users" on users
  for all using (public.is_owner()) with check (public.is_owner());

create policy "Users read their profile" on users
  for select using (auth.uid() = id);

-- Vehicles: owners & dispatchers manage, accountants view, drivers limited read
create policy "Owners manage vehicles" on vehicles
  for all using (public.is_owner()) with check (public.is_owner());

create policy "Dispatchers manage vehicles" on vehicles
  for all using (public.has_role('dispatcher')) with check (public.has_role('dispatcher'));

create policy "Accountants view vehicles" on vehicles
  for select using (public.has_role('accountant'));

create policy "Drivers view assigned vehicle" on vehicles
  for select using (exists (
    select 1 from public.drivers d
    where d.user_id = auth.uid() and d.assigned_vehicle_id = vehicles.id
  ));

-- Drivers: owners & dispatchers manage, drivers see their profile
create policy "Owners manage drivers" on drivers
  for all using (public.is_owner()) with check (public.is_owner());

create policy "Dispatchers manage drivers" on drivers
  for all using (public.has_role('dispatcher')) with check (public.has_role('dispatcher'));

create policy "Drivers view their record" on drivers
  for select using (drivers.user_id = auth.uid());

-- Trips: owners & dispatchers full access, drivers limited to own trips, accountants read
create policy "Owners manage trips" on trips
  for all using (public.is_owner()) with check (public.is_owner());

create policy "Dispatchers manage trips" on trips
  for all using (public.has_role('dispatcher')) with check (public.has_role('dispatcher'));

create policy "Drivers update their trips" on trips
  for select, update using (trips.driver_id = (select id from public.drivers where user_id = auth.uid()))
  with check (trips.driver_id = (select id from public.drivers where user_id = auth.uid()));

create policy "Accountants view trips" on trips
  for select using (public.has_role('accountant'));

-- Expenses: owners & accountants manage, dispatchers view, drivers no access
create policy "Owners manage expenses" on expenses
  for all using (public.is_owner()) with check (public.is_owner());

create policy "Accountants manage expenses" on expenses
  for all using (public.has_role('accountant')) with check (public.has_role('accountant'));

create policy "Dispatchers view expenses" on expenses
  for select using (public.has_role('dispatcher'));
