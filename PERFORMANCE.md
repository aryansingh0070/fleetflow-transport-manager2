# Performance Optimizations

## Strategy
1. **Code splitting & lazy loading:** Critical sections (Dashboard, AI Insights, Maps, Finance panel) load only when requested via `React.lazy` + `Suspense`, reducing the initial bundle size and speeding up first paint.
2. **Memoization:** The `OperationsPanel` is wrapped with `React.memo` so the heavy CRUD forms re-render only when their props change.
3. **Hook optimization:** `useMemo` in the dashboard aggregates business metrics once per state change, avoiding repeated loops inside renders.
4. **Error boundary + Sentry:** Protects rendering performance and surfaces issues without crashing the entire UI.

## Bundle Reduction
- Lazy-loaded pages and panels prevent `Chart.js`, `Leaflet`, and finance modules from being part of the initial chunk.
- Shared charts remain tree-shaken by Vite; bundle size analysis via `npm run build` shows the main chunk remains under 2 MB.

## Lazy Loading Approach
- `App.tsx` dynamically loads the Dashboard, AI Insights, and Maps pages depending on the active navigation state.
- The finance panel inside the dashboard is also lazy-loaded to defer heavy exports/analytics until the user scrolls there.
- Suspense fallbacks display lightweight skeleton screens while modules load.
