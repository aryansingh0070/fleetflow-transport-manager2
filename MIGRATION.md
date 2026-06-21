# LocalStorage to Supabase Migration

1. Export existing data from the browser's LocalStorage for FleetFlow (vehicles, drivers, trips, expenses, users). You can open the browser console and read each key to capture JSON payloads.
2. Cleanse and normalize the data to match the SQL schema in `db/schema.sql`. Pay attention to UUIDs, timestamps, and required columns (email, role, status, etc.).
3. Insert the cleaned datasets into Supabase using SQL scripts or the Supabase Table Editor. Start by inserting `users` so that foreign keys (like `drivers.user_id`) remain valid.
4. For each vehicle, trip, driver, and expense record, ensure the `updated_at`, `created_at`, and `occurred_at` timestamps reflect the original event dates.
5. After data is seeded, verify the migrated rows via Supabase SQL queries or the Table Editor.
6. Update any Supabase policies to allow the Roles (owner, accountant, dispatcher, driver) to access the appropriate resources for the app.
7. Once the database is seeded, delete the old LocalStorage entries or replace them with placeholders, and let the React UI rely on Supabase.
