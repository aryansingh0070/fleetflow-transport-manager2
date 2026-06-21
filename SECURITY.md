# Security Overview

This document summarizes the production-ready security posture for FleetFlow Transport Manager after Phase 1 hardening.

## Row Level Security
Every application table now enforces Supabase Row Level Security (RLS) to prevent unauthorized data access. The following tables have RLS turned on:

- `public.users`
- `public.vehicles`
- `public.drivers`
- `public.trips`
- `public.expenses`

## Policies by Role
We created reusable helper functions (`public.is_owner()`, `public.has_role()`, `public.has_any_role()`) and applied policies tailored per role:

| Role       | Tables Controlled | Access Level |
|------------|-------------------|--------------|
| Owner      | All               | Full (select/insert/update/delete)
| Accountant | Trips, Expenses, Finance views | Read/write on financial data |
| Dispatcher | Trips, Vehicles, Drivers | Operational management of crew/assets |
| Driver     | Trips, Drivers, Vehicles | Access only to their records |

Policy examples:

- **Trips**: Owners and dispatchers can manage all trips; accountants can read; drivers can view/update their assigned trip statuses.
- **Vehicles**: Dispatchers and owners manage vehicles; accountants may view; drivers read only their assigned vehicle.
- **Expenses**: Owners and accountants manage; dispatchers view; driver access denied.

## Access Guardrails
- Policies use `auth.uid()` to tie requests to the `users` profile.
- Helper functions guarantee consistent role checks across policies.
- Each policy is scoped with precise `USING` and `WITH CHECK` clauses to prevent privilege escalation.

## Key Takeaways
- No data can be read or mutated unless row policies explicitly allow the user's role.
- Existing frontend functionality continues to operate because its authenticated Supabase session matches the policies above.
- The database now enforces multi-tenant safe access without relying solely on client-side filtering.
