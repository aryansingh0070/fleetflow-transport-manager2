# FleetFlow Transport Manager

![Build Status](https://github.com/your-org/fleetflow-transport-manager/actions/workflows/ci.yml/badge.svg)
![Test Status](https://github.com/your-org/fleetflow-transport-manager/actions/workflows/ci.yml/badge.svg)

## Project Overview
FleetFlow Transport Manager is a production-grade SaaS-style fleet operations cockpit built with React, Vite, Tailwind CSS, and Supabase. It unifies authentication, role-aware dashboards, analytics, finance controls, AI insights, and map-based route visualization into a single portfolio-ready experience for internship or product-engineering showcases.

## CI/CD
- **Pipeline** runs on every `push` and `pull_request` targeting `main` or `master`.
- **Steps:** `npm install`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- Fails fast on lint/typecheck/test/build errors to maintain a stable mainline.

## Features
- Supabase authentication with session persistence and role-based access (Owner, Accountant, Dispatcher, Driver).
- KPI dashboards, Chart.js analytics, and finance reporting with revenue/expense tracking.
- Trip, vehicle, and driver CRUD with validations, assignments, alerts, toasts, and confirmations.
- Export-ready PDF invoices/monthly reports (jsPDF) plus Excel feeds (SheetJS).
- AI-generated business insights (mock deterministic intelligence) for trends, top performers, and recommendations.
- Leaflet-based fleet and route maps highlighting vehicle locations and top routes.
- Responsive layout with collapsible sidebar, toasts, skeleton states, light/dark themes, and accessibility-focused markup.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend/Data:** Supabase (PostgreSQL + Auth)
- **Analytics/Exports:** Chart.js (via react-chartjs-2), jsPDF, SheetJS
- **Maps:** Leaflet
- **Tooling:** npm, Vite build, Git

## Architecture
```
[App] -> ThemeProvider -> ToastProvider
         -> Layout (sidebar + mobile drawer)
            -> AuthGate -> Dashboard / Operations / Finance / AI Insights / Maps
                -> useFleetSession (Supabase + contexts)
                -> Services (fetchFleetSnapshot, operationsService)
                -> Hooks (useFleetTrends)
                -> Components (Charts, Insights, Finance, Maps)
``` 

### Architecture Diagram (Markdown)
```
┌─────────────────────┐
│  Supabase Backend   │
│  (DB + Auth + RPC)  │
└─────────┬───────────┘
          │
┌─────────▼───────────┐        ┌────────────────────────┐
│ React + Tailwind UI │◄───────│ Theme & Toast Providers│
├─────────┬───────────┤        └─────────┬──────────────┘
│ Layout  │ Hooks/Services│
│ └── Pages (Dashboard, Finance, Insights, Maps)│
└─────────────────────┘
``` 

## Database Schema
- **users:** id, email, full_name, organization, role (owner/accountant/dispatcher/driver)
- **vehicles:** uuid, name, vehicle_number, type, capacity, plate, status, insurance & registration expiry
- **drivers:** uuid, full_name, phone, license_number & expiry, assigned_vehicle_id, status
- **trips:** uuid, origin, destination, revenue, status (pending → assigned → in_transit → completed/cancelled), driver_id, vehicle_id
- **expenses:** uuid, trip_id, category, amount, occurred_at

## Authentication Flow
1. Users sign in via Supabase email/password.
2. Sessions are persisted via Supabase auth client across reloads.
3. `useFleetSession` fetches the user profile, synchronizes fleet data, and exposes login/logout.

## Role-Based Access
- UI adapts to the user's `role` field (Owner/Accountant/Dispatcher/Driver).
- Access controls live in UI (different playlists, analytics, and operations available) and should map to Supabase row-level policies.

## Analytics Features
- KPI grid, revenue & expense line charts, trip cadence bar chart, and vehicle utilization doughnut chart.
- `useFleetTrends` hook aggregates rolling monthly data for charts and finance exports.

## Finance Features
- Finance panel summarizes revenue, expense, and monthly profit.
- Expense breakdown tags and provides contextual metadata.
- Downloads: Trip invoices PDF, monthly report PDF, Excel exports for trips, vehicles, drivers, expenses.

## PDF & Excel Exports
`jsPDF` builds printable invoices/reports. `SheetJS (xlsx)` exports Excel workbooks for trips, vehicles, drivers, and expenses with Supabase data.

## AI Insights
- Deterministic mock insights compute trends, top vehicle/driver, best route, and recommendations using Supabase data.
- `AIInsightsPage` uses reusable `InsightCard` and `ExecutiveSummary` components.

## Maps & Route Analytics
- Leaflet-based `FleetMap` visualizes vehicle markers with mock coordinates.
- `RouteMap` renders a recommended route polyline, markers, and distance summary.

## Installation Guide
```bash
git clone <repo>
cd fleetflow
npm install
cp .env.example .env.local
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Environment Variables
- `VITE_SUPABASE_URL` – your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` – the public anon key (or service role for server migrations)

## Deployment Guide
1. Build for production: `npm run build`
2. Deploy `dist/` to Vercel, Netlify, or static hosting.
3. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in host env variables.
4. Enable HTTPS and review Supabase RLS policies for security.

## Future Improvements
- Implement real AI insights via OpenAI or LangChain.
- Add real-time GPS by integrating Supabase Realtime or Mapbox trackers.
- Extend reporting with drill-down tables and scheduled exports.
- Harden security via Supabase RLS policies per role.
