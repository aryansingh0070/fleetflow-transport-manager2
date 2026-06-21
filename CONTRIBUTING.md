# Contributing to FleetFlow Transport Manager

## Local setup
1. Clone the repo and install dependencies:
   ```bash
   git clone <repo-url>
   cd fleetflow
   npm install
   ```
2. Create `.env.local` from `.env.example` and supply your Supabase credentials.
3. Run the dev server:
   ```bash
   npm run dev
   ```

## Testing
- **Unit & Integration:** `npm test`
- **Coverage:** `npm run test:coverage`
- **Linting:** `npm run lint`
- **Type checking:** `npm run typecheck`

## Pull request workflow
1. Create feature branches off `main`.
2. Keep asynchronous commits focused and targeted.
3. Run lint, typecheck, and tests locally before pushing.
4. Open a PR targeting `main` with a descriptive title and test summary.
5. Ensure the CI workflow (`.github/workflows/ci.yml`) passes before merging.
